import requests
import certifi
from bs4 import BeautifulSoup
import pandas as pd
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.screener.in/",
}


def build_url(symbol: str, view: str = "consolidated") -> str:
    symbol = symbol.strip().upper()
    if view == "consolidated":
        return f"https://www.screener.in/company/{symbol}/consolidated/"
    return f"https://www.screener.in/company/{symbol}/"


def parse_table(table_tag) -> pd.DataFrame:
    rows = table_tag.find_all("tr")
    data = []
    for row in rows:
        cols = row.find_all(["td", "th"])
        data.append([c.get_text(separator=" ", strip=True) for c in cols])
    if not data:
        return pd.DataFrame()
    header = data[0]
    body = [r for r in data[1:] if any(cell.strip() for cell in r)]
    return pd.DataFrame(body, columns=header)


def df_to_table(df: pd.DataFrame | None) -> dict:
    if df is None or df.empty:
        return {"columns": [], "rows": []}
    return {
        "columns": [str(c) for c in df.columns.tolist()],
        "rows": [[str(cell) for cell in row] for row in df.values.tolist()],
    }


def fetch_page(url: str) -> tuple[BeautifulSoup, str]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20, verify=certifi.where())
    except requests.exceptions.SSLError:
        # Fallback for environments with incomplete CA bundles (common on some Windows setups)
        resp = requests.get(url, headers=HEADERS, timeout=20, verify=False)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "lxml"), resp.url


def scrape_key_ratios(soup: BeautifulSoup) -> dict:
    top_ratios = {}
    top_section = soup.find(id="top-ratios")
    if not top_section:
        top_section = soup.find("div", class_=lambda c: c and "company-ratios" in c)

    if top_section:
        for item in top_section.find_all("li"):
            spans = item.find_all("span")
            if len(spans) >= 2:
                name = spans[0].get_text(strip=True)
                value = spans[-1].get_text(strip=True)
                if name:
                    top_ratios[name] = value

    company_name = soup.find("h1", class_=lambda c: c and "company-name" in c)
    if not company_name:
        company_name = soup.find("h1")

    about = soup.find("div", class_=lambda c: c and "about" in (c or ""))
    if not about:
        about = soup.find("p", class_=lambda c: c and "about" in (c or ""))

    return {
        "company_name": company_name.get_text(strip=True) if company_name else None,
        "about": about.get_text(separator=" ", strip=True) if about else None,
        "top_ratios": top_ratios,
    }


def scrape_section_table(soup: BeautifulSoup, section_id: str) -> dict:
    section = soup.find(id=section_id)
    if not section:
        return df_to_table(None)
    table = section.find("table")
    if not table:
        return df_to_table(None)
    return df_to_table(parse_table(table))


def scrape_shareholding(soup: BeautifulSoup) -> dict:
    section = soup.find(id="shareholding") or soup.find(id="shareholding-pattern")
    if section:
        table = section.find("table")
        if table:
            return df_to_table(parse_table(table))

    for table in soup.find_all("table"):
        text = table.get_text().lower()
        if "promoter" in text or "institutional" in text:
            return df_to_table(parse_table(table))

    return df_to_table(None)


def scrape_highlighted_ratios(df: pd.DataFrame) -> dict:
    if df.empty:
        return {}

    target_keywords = [
        "p/e", "pe ratio", "price to earning",
        "p/b", "pb ratio", "price to book",
        "asset turnover",
        "cash conversion cycle", "cash cycle",
        "debtor days", "inventory days", "creditor days",
        "roce", "roe", "return on equity", "return on capital",
        "eps", "dividend yield",
        "debt to equity", "interest coverage",
    ]
    highlights = {}
    for _, row in df.iterrows():
        row_str = " ".join(str(v) for v in row.values).lower()
        for kw in target_keywords:
            if kw in row_str:
                metric = str(row.iloc[0]) if len(row) > 0 else "?"
                highlights[metric] = [str(v) for v in row.values[1:]]
                break
    return highlights


def scrape_ratios(soup: BeautifulSoup) -> dict:
    section = soup.find(id="ratios")
    if not section:
        return {"table": df_to_table(None), "highlights": {}}
    table = section.find("table")
    if not table:
        return {"table": df_to_table(None), "highlights": {}}
    df = parse_table(table)
    return {
        "table": df_to_table(df),
        "highlights": scrape_highlighted_ratios(df),
    }


def get_stock_details(symbol: str, view: str = "consolidated") -> dict:
    symbol = symbol.strip().upper()
    url = build_url(symbol, view)
    actual_view = view

    try:
        soup, final_url = fetch_page(url)
    except requests.exceptions.HTTPError:
        if view == "consolidated":
            url = build_url(symbol, "standalone")
            soup, final_url = fetch_page(url)
            actual_view = "standalone"
        else:
            raise

    if "/consolidated/" in url and "/consolidated/" not in final_url:
        actual_view = "standalone"

    key_info = scrape_key_ratios(soup)

    return {
        "symbol": symbol,
        "view": actual_view,
        "source_url": final_url,
        "company_name": key_info["company_name"],
        "about": key_info["about"],
        "key_ratios": key_info["top_ratios"],
        "quarterly": scrape_section_table(soup, "quarters"),
        "profit_loss": scrape_section_table(soup, "profit-loss"),
        "balance_sheet": scrape_section_table(soup, "balance-sheet"),
        "cash_flow": scrape_section_table(soup, "cash-flow"),
        "ratios": scrape_ratios(soup),
        "shareholding": scrape_shareholding(soup),
        "peers": scrape_section_table(soup, "peers"),
        "annual_results": scrape_section_table(soup, "annual-results"),
    }
