import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import os

st.set_page_config(page_title="ZamindarAI Impact", layout="wide")

API_BASE = os.getenv("ZAMINDARAI_API_URL", "http://localhost:8000")

st.header("📊 Collective Intelligence Dashboard")
st.caption("System-wide agricultural insights from AI analysis")

# Fetch data
try:
    res = requests.get(f"{API_BASE}/impact/summary").json()
except Exception as e:
    st.error(f"Connection error: {e}")
    res = {}

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Farmers Protected", res.get("total_farmers", 0), "+12%")
col2.metric("Avg. Price Fairness", f"{res.get('fairness_index', 0):.0%}", "+8%")
col3.metric("Disease Alerts Active", res.get("active_outbreaks", 0), "2 new")
col4.metric("Money Saved", f"PKR {res.get('money_saved', 0):,}", "↑")

# Exploitation Heatmap
st.subheader("District Exploitation Index (Lower is Better)")
fairness_data = pd.DataFrame(res.get("district_fairness", []))
if not fairness_data.empty:
    fig = px.bar(fairness_data, x="district", y="fairness_index",
                 color="fairness_index", color_continuous_scale="RdYlGn")
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("No price check data yet. Farmers will appear here after using Price Check.")

# Disease Outbreaks
st.subheader("Active Disease Outbreaks")
outbreaks = pd.DataFrame(res.get("outbreaks", []))
if not outbreaks.empty:
    st.dataframe(outbreaks, use_container_width=True)
    fig2 = px.scatter_mapbox(outbreaks, lat="lat", lon="lon", size="case_count",
                             color="crop_type", hover_name="district",
                             mapbox_style="carto-positron", zoom=5)
    st.plotly_chart(fig2, use_container_width=True)
else:
    st.info("No active outbreaks. Kisan Council is monitoring.")
