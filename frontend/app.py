import streamlit as st
import requests
from PIL import Image
import io
import os

API_BASE = os.getenv("ZAMINDARAI_API_URL", "http://localhost:8000")

st.set_page_config(page_title="ZamindarAI", page_icon="🌾", layout="wide")

st.markdown("""
<style>
.main-title { font-size: 2.8rem; color: #1B5E20; text-align: center; font-weight: bold; }
.sub-title { font-size: 1.2rem; color: #388E3C; text-align: center; margin-bottom: 2rem; }
.agent-card { background: #F1F8E9; padding: 20px; border-radius: 12px; border-left: 5px solid #689F38; }
.warning { background: #FFF3E0; border-left-color: #F57C00; }
.success { background: #E8F5E9; border-left-color: #4CAF50; }
.danger { background: #FFEBEE; border-left-color: #E53935; }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">🌾 ZamindarAI</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Kisaan Ka Digital Muhaafiz | Solo Founder Edition</div>', unsafe_allow_html=True)

# ========== SIDEBAR: FARMER PROFILE ==========
with st.sidebar:
    st.header("👤 Kisaan Profile")

    # Show backend AI status
    try:
        health = requests.get(f"{API_BASE}/health", timeout=3)
        if health.status_code == 200:
            st.success("🟢 Backend Online")
        else:
            st.warning("🟡 Backend unreachable")
    except Exception:
        st.error("🔴 Backend offline")

    with st.form("farmer_form"):
        name = st.text_input("Naam", "Ali Ahmed", key="sb_name")
        phone = st.text_input("Phone", "03001234567", key="sb_phone")
        district = st.selectbox("Zila", ["Gujranwala", "Faisalabad", "Lahore", "Multan", "Sialkot"], key="sb_district")
        farm_size = st.number_input("Zameen (acres)", min_value=0.5, max_value=500.0, value=8.0, key="sb_farm_size")
        primary_crop = st.selectbox("Main Fasal", ["Wheat", "Rice", "Cotton", "Sugarcane", "Vegetables"], key="sb_crop")

        submitted = st.form_submit_button("✅ Save Profile")
        if submitted:
            try:
                res = requests.post(f"{API_BASE}/farmers/", json={
                    "name": name, "phone": phone, "district": district,
                    "farm_size_acres": farm_size, "primary_crop": primary_crop
                })
                if res.status_code == 200:
                    st.session_state["farmer"] = res.json()
                    st.success("Profile saved!")
                else:
                    try:
                        detail = res.json().get("detail", res.text)
                    except Exception:
                        detail = res.text or f"HTTP {res.status_code}"
                    st.error(f"Error: {detail}")
            except Exception as e:
                st.error(f"Connection error: {e}")

    if "farmer" in st.session_state:
        f = st.session_state["farmer"]
        st.info(f"ID: {f['id']} | {f['district']} | {f['primary_crop']}")

    st.divider()
    st.caption("🔒 Data stored securely. CNIC not required for demo.")

# ========== MAIN TABS ==========
tab_council, tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🧠 Kisan Council",
    "📸 Crop Doctor",
    "💰 Price Check",
    "🌱 Soil Advisor",
    "📜 Deal Guardian",
    "📊 My History"
])

# ----- TAB 0: KISAN COUNCIL -----
with tab_council:
    st.header("🧠 Kisan Council - Aapki Smart Panel")
    st.caption("Kuch bhi puchain. AI council aapke liye experts bulayegi.")

    if "farmer" not in st.session_state:
        st.warning("Sidebar se profile banain!")
    else:
        farmer_id = st.session_state["farmer"]["id"]

        # Chat history
        if "chat_history" not in st.session_state:
            st.session_state["chat_history"] = []

        # Display history
        for msg in st.session_state["chat_history"]:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])
                if msg.get("plan"):
                    with st.expander("Dekhein konsi agents ne jawab diya"):
                        st.json(msg["plan"])

        # Input
        user_input = st.chat_input("Yahan likhein... (e.g., 'Mere gandum pe zard dhabbay hain aur aarti 25 de raha hai')")

        if user_input:
            # Show user message
            st.session_state["chat_history"].append({"role": "user", "content": user_input})
            with st.chat_message("user"):
                st.markdown(user_input)

            # Call council
            with st.chat_message("assistant"):
                with st.spinner("Kisan Council soch rahi hai..."):
                    try:
                        res = requests.post(f"{API_BASE}/council/chat", data={
                            "farmer_id": farmer_id,
                            "message": user_input
                        })
                        data = res.json()

                        st.markdown(data["response"])

                        # Show which agents worked
                        with st.expander("Agents Called"):
                            cols = st.columns(len(data["plan"]["agents_needed"]))
                            agent_emojis = {"CropDoctor": "🩺", "PriceOracle": "💰", "SoilAdvisor": "🌱", "DealGuardian": "📜"}
                            for i, agent in enumerate(data["plan"]["agents_needed"]):
                                emoji = agent_emojis.get(agent, "🤖")
                                cols[i].metric(f"{emoji} {agent}", "Active")

                        # Save to history
                        st.session_state["chat_history"].append({
                            "role": "assistant",
                            "content": data["response"],
                            "plan": data["plan"]
                        })
                    except Exception as e:
                        st.error(f"Connection error: {e}")

        # Voice upload
        audio_file = st.file_uploader("Ya awaaz record karein (WAV/MP3)", type=["wav", "mp3"], key="voice")
        if audio_file and st.button("Transcribe & Send"):
            with st.spinner("Awaaz sun raha hai..."):
                try:
                    files = {"audio": (audio_file.name, audio_file.getvalue(), audio_file.type)}
                    data = {"farmer_id": farmer_id}
                    res = requests.post(f"{API_BASE}/council/voice", files=files, data=data)
                    if res.status_code == 200:
                        vdata = res.json()
                        st.markdown(f"**Transcription:** {vdata['transcription']}")
                        st.markdown(vdata["response"])
                        st.session_state["chat_history"].append({
                            "role": "user",
                            "content": f"[Voice] {vdata['transcription']}"
                        })
                        st.session_state["chat_history"].append({
                            "role": "assistant",
                            "content": vdata["response"]
                        })
                    else:
                        st.error(f"Error: {res.status_code}")
                except Exception as e:
                    st.error(f"Connection error: {e}")

# ----- TAB 1: CROP DOCTOR -----
with tab1:
    st.header("🩺 Dr. Zarai - Fasal Ka Doctor")
    st.caption("Tasweer upload karein. AI bimari pehchane ga aur ilaj batayega.")

    if "farmer" not in st.session_state:
        st.warning("⚠️ Pehle sidebar se apna profile banain!")
    else:
        farmer_id = st.session_state["farmer"]["id"]

        col1, col2 = st.columns([1, 1.2])

        with col1:
            crop = st.text_input("Fasal Ka Naam", primary_crop, key="cd_crop")
            uploaded = st.file_uploader("Tasweer", type=["jpg", "png", "jpeg"], key="cd_image")

            if uploaded and st.button("🔍 Diagnose", type="primary", use_container_width=True):
                with st.spinner("Dr. Zarai dekh raha hai..."):
                    try:
                        files = {"image": (uploaded.name, uploaded.getvalue(), uploaded.type)}
                        data = {"farmer_id": farmer_id, "crop_type": crop}
                        res = requests.post(f"{API_BASE}/diagnoses/", files=files, data=data)

                        if res.status_code == 200:
                            st.session_state["last_diagnosis"] = res.json()
                        else:
                            st.error(f"Error! Status: {res.status_code}")
                    except Exception as e:
                        st.error(f"Connection error: {e}")

        with col2:
            if "last_diagnosis" in st.session_state:
                d = st.session_state["last_diagnosis"]
                st.markdown('<div class="agent-card">', unsafe_allow_html=True)
                st.subheader("🔬 AI Vision Result")
                st.write(d["vision_analysis"])
                st.divider()
                st.subheader("💊 Ilaj (Treatment)")
                st.markdown(d["treatment"])
                st.markdown('</div>', unsafe_allow_html=True)

# ----- TAB 2: PRICE CHECK -----
with tab2:
    st.header("💰 MandiMaster - Sahi Qeemat")

    if "farmer" not in st.session_state:
        st.warning("⚠️ Pehle profile banain!")
    else:
        farmer_id = st.session_state["farmer"]["id"]
        farmer_district = st.session_state["farmer"]["district"]

        col1, col2 = st.columns([1, 1.2])

        with col1:
            sale_crop = st.text_input("Bechnay Wali Fasal", primary_crop, key="pc_crop")
            qty = st.text_input("Miqdaar", "1000 kg", key="pc_qty")
            offered = st.number_input("Aarti Ne Kitni Di? (PKR/kg)", min_value=1, value=25, key="pc_offered")

            if st.button("🧮 Analyze Price", type="primary", use_container_width=True):
                with st.spinner("Mandi rates check ho rahe hain..."):
                    try:
                        res = requests.post(f"{API_BASE}/prices/check", json={
                            "farmer_id": farmer_id,
                            "crop": sale_crop,
                            "quantity": qty,
                            "location": farmer_district,
                            "offered_price": offered
                        })
                        if res.status_code == 200:
                            st.session_state["last_price"] = res.json()
                        else:
                            st.error(f"Error! Status: {res.status_code}")
                    except Exception as e:
                        st.error(f"Connection error: {e}")

        with col2:
            if "last_price" in st.session_state:
                p = st.session_state["last_price"]
                is_fair = p["is_fair"]
                css_class = "success" if is_fair else "danger"

                st.markdown(f'<div class="agent-card {css_class}">', unsafe_allow_html=True)
                if not is_fair:
                    st.error("⚠️ KHATRA: Aapko nuksaan ho raha hai!")
                else:
                    st.success("✅ Rate theek hai")

                st.markdown(p["analysis"])

                if p["market_rate"]:
                    st.metric("Mandi Rate", f"PKR {p['market_rate']}/kg")
                st.markdown('</div>', unsafe_allow_html=True)

# ----- TAB 3: SOIL ADVISOR -----
with tab3:
    st.header("🌱 ZaminExpert - Mitti Ki Pehchaan")

    if "farmer" not in st.session_state:
        st.warning("⚠️ Pehle profile banain!")
    else:
        farmer_id = st.session_state["farmer"]["id"]
        farmer_district = st.session_state["farmer"]["district"]

        soil_crop = st.text_input("Fasal", primary_crop, key="sa_crop")
        soil_type = st.selectbox("Mitti", ["Unknown", "Sandy", "Clay", "Loamy"], key="sa_soil")
        prev = st.selectbox("Pichli Fasal", ["None", "Wheat", "Rice", "Cotton"], key="sa_prev")
        question = st.text_area("Apna sawal likhein",
            "Gandum ke liye kaunsa khad behtar hai?", key="sa_question")

        if st.button("🌾 Get Advice", type="primary"):
            with st.spinner("ZaminExpert soch raha hai..."):
                try:
                    res = requests.post(f"{API_BASE}/soil/advise", data={
                        "farmer_id": farmer_id,
                        "location": farmer_district,
                        "current_crop": soil_crop,
                        "previous_crop": prev,
                        "soil_type": soil_type,
                        "question": question
                    })
                    if res.status_code == 200:
                        st.session_state["last_soil"] = res.json()
                    else:
                        st.error(f"Error! Status: {res.status_code}")
                except Exception as e:
                    st.error(f"Connection error: {e}")

        if "last_soil" in st.session_state:
            s = st.session_state["last_soil"]
            st.markdown('<div class="agent-card">', unsafe_allow_html=True)
            st.subheader("🌾 ZaminExpert Advice")
            st.markdown(s["advice"])
            st.markdown('</div>', unsafe_allow_html=True)

# ----- TAB 4: DEAL GUARDIAN -----
with tab4:
    st.header("📜 Muhaafiz - Soda Hifazat")

    if "farmer" not in st.session_state:
        st.warning("⚠️ Pehle profile banain!")
    else:
        farmer_id = st.session_state["farmer"]["id"]

        buyer = st.text_input("Kharidaar Ka Naam", "Local Aarti", key="dg_buyer")
        deal_crop = st.text_input("Fasal", primary_crop, key="dg_crop")
        deal_qty = st.text_input("Miqdaar", "500 kg", key="dg_qty")
        deal_price = st.number_input("Qeemat (PKR/kg)", min_value=1, value=25, key="dg_price")

        if st.button("📋 Generate Contract", type="primary"):
            with st.spinner("Contract tayyar ho raha hai..."):
                try:
                    res = requests.post(f"{API_BASE}/contracts/generate", json={
                        "farmer_id": farmer_id,
                        "buyer_name": buyer,
                        "crop": deal_crop,
                        "quantity": deal_qty,
                        "price_per_kg": deal_price
                    })
                    if res.status_code == 200:
                        st.session_state["last_contract"] = res.json()
                    else:
                        st.error(f"Error! Status: {res.status_code}")
                except Exception as e:
                    st.error(f"Connection error: {e}")

        if "last_contract" in st.session_state:
            c = st.session_state["last_contract"]
            css = "success" if c["is_fair"] else "danger"
            st.markdown(f'<div class="agent-card {css}">', unsafe_allow_html=True)

            if c["warnings"]:
                for w in c["warnings"]:
                    st.warning(w)

            st.text_area("Contract", c["contract_text"], height=300)
            st.download_button("⬇️ Download", c["contract_text"],
                             file_name=f"contract_{st.session_state['farmer']['name']}.txt")
            st.markdown('</div>', unsafe_allow_html=True)

# ----- TAB 5: HISTORY -----
with tab5:
    st.header("📊 Meri Report - My Farming History")

    if "farmer" not in st.session_state:
        st.warning("Profile needed!")
    else:
        farmer_id = st.session_state["farmer"]["id"]
        st.info("This tab shows saved diagnoses, price checks, and contracts from the database.")
        st.write("Every farmer gets a permanent digital record of their farming decisions.")
        try:
            res = requests.get(f"{API_BASE}/farmers/{farmer_id}")
            if res.status_code == 200:
                st.json(res.json())
            else:
                st.warning("Could not fetch history")
        except Exception as e:
            st.error(f"Connection error: {e}")
