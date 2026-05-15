# -*- coding: utf-8 -*-
"""Generuje js/wzory-symbol-legends.js — mapę legend symboli dla fiszek z cards-wzory-cke.js."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "js" / "cards-wzory-cke.js"
OUT = ROOT / "js" / "wzory-symbol-legends.js"

SEP = "\x1e"


def parse_cards(text):
    pat = re.compile(
        r'topic:\s*"([^"]+)"\s*,\s*front:\s*"([^"]+)"\s*,\s*back:\s*String\.raw`([^`]*)`',
        re.MULTILINE,
    )
    return [{"topic": m.group(1), "front": m.group(2), "back": m.group(3)} for m in pat.finditer(text)]


# Najpierw złożone wzorce całych wzorów (żeby nie dublować pojedynczych symboli).
MORE = [
    (r"v = \omega r", r"v,\,\omega,\,r", "prędkość liniowa; częstość kątowa; promień okręgu"),
    (r"v = H d", r"v,\,H,\,d", "prędkość oddalania; stała Hubble'a; odległość"),
    (r"s = v_0 t", r"s,\,v_0,\,a,\,t", "droga; prędkość początkowa; przyspieszenie; czas"),
    (r"T = \dfrac{1}{f}", r"T,\,f", "okres; częstotliwość"),
    (r"\omega = \dfrac{2\pi}{T}", r"\pi", "liczba pi"),
    (r"L = I \omega", r"L,\,I,\,\omega", "moment pędu; moment bezwładności; prędkość kątowa"),
    (r"I \varepsilon = M", r"I,\,\varepsilon,\,M", "moment bezwładności; przyspieszenie kątowe; moment siły"),
    (r"P = \dfrac{W}{\Delta t}", r"P,\,W,\,\Delta t", "moc średnia; praca; przedział czasu"),
    (r"E_{\mathrm{kin}} = \dfrac{1}{2} m v^2", r"m,\,v", "masa; prędkość (moduł)"),
    (r"E_{\mathrm{kin}} = \dfrac{1}{2} I \omega^2", r"I,\,\omega", "moment bezwładności; prędkość kątowa"),
    (r"v_u = \sqrt{\dfrac{2 G M}{r}}", r"v_u,\,G,\,M,\,r", "prędkość ucieczki; stała grawitacji; masa centralna; odległość"),
    (r"x_{\max} = A", r"x_{\max},\,A", "maksymalne wychylenie; amplituda drgań"),
    (r"v_{\max} = A \omega", r"v_{\max},\,A,\,\omega", "maks. prędkość drgań; amplituda; częstość kątowa"),
    (r"a_{\max} = A \omega^2", r"a_{\max},\,A,\,\omega", "maks. przyspieszenie drgań; amplituda; częstość kątowa"),
    (r"v = \dfrac{\lambda}{T}", r"v,\,\lambda,\,T,\,f", "prędkość fali; długość fali; okres; częstotliwość"),
    (r"I \propto \dfrac{1}{r^2}", r"I,\,r", "natężenie fali; odległość od źródła"),
    (r"\Delta U = Q + W", r"\Delta U,\,Q,\,W", "zmiana energii wewnętrnej; ciepło; praca"),
    (r"|W| = p\,|\Delta V|", r"p,\,\Delta V", "ciśnienie; zmiana objętości"),
    (r"C = \dfrac{Q}{n\,\Delta T}", r"C,\,Q,\,n,\,\Delta T", "ciepło molowe; ciepło; liczba moli; zmiana temperatury"),
    (r"L = \dfrac{Q}{m}", r"L,\,Q,\,m", "ciepło przemiany fazowej (właściwe); ciepło; masa"),
    (r"U = E d", r"U,\,E,\,d", "napięcie; natężenie pola jednorodnego; odległość"),
    (r"E = k \dfrac{Q}{r^2}", r"E,\,k,\,Q,\,r", "natężenie pola; stała; ładunek sfery; odległość od środka"),
    (r"W = \dfrac{Q^2}{2C}", r"W,\,Q,\,C,\,U", "energia w kondensatorze; ładunek; pojemność; napięcie (równoważne postacie)"),
    (r"\dfrac{1}{x} + \dfrac{1}{y} = \dfrac{1}{f}", r"x,\,y,\,f", "odległość przedmiotu; obrazu; ogniskowa"),
    (r"F_s = -k x", r"F_s,\,k,\,x", "siła sprężystości; stała sprężyny; odkształcenie"),
    (r"E_{\mathrm{pot}} = \dfrac{1}{2} k x^2", r"k,\,x", "stała sprężystości; odkształcenie"),
    (r"\vec{p} = m \vec{v}", r"m", "masa punktu materialnego"),
    (r"m \vec{a} = \vec{F}", r"m", "masa"),
    (r"\gamma = \dfrac{F_g}{m}", r"\gamma,\,F_g,\,m", "natężenie pola grawitacyjnego; siła grawitacji; masa próbna"),
    (r"\Delta E_p = m g \Delta h", r"m,\,g,\,\Delta h", "masa; przyspieszenie ziemskie; różnica wysokości"),
]

# Fragment we wzorze → [KaTeX do wyświetlenia, opis PL]. Kolejność: dłuższe wzorce pierwsze.
CATALOG = MORE + [
    (r"\vec{E}_0", r"\vec{E}_0", "pole padające na polaryzator (wektor)"),
    (r"\vec{E}_P", r"\vec{E}_P", "pole po przejściu przez polaryzator"),
    (r"\vec{E}_{\mathrm{wew}}", r"\vec{E}_{\mathrm{wew}}", "natężenie wewnątrz przewodnika w równowadze"),
    (r"\vec{E}_{\mathrm{pow}}", r"\vec{E}_{\mathrm{pow}}", "natężenie na powierzchni przewodnika"),
    (r"\vec{E}_0", r"\vec{E}_0", "natężenie zewnętrzne (przed dielektrykiem)"),
    (r"\Delta \vec{r}", r"\Delta \vec{r}", "przyrost wektora położenia (przemieszczenie)"),
    (r"\Delta \vec{v}", r"\Delta \vec{v}", "przyrost wektora prędkości"),
    (r"\Delta \vec{S}", r"\Delta \vec{S}", "wektor powierzchni"),
    (r"\Delta \vec{\ell}", r"\Delta \vec{\ell}", "wektor odcinka przewodnika"),
    (r"\vec{v}_0", r"\vec{v}_0", "prędkość początkowa (wektor)"),
    (r"\vec{v}", r"\vec{v}", "wektor prędkości"),
    (r"\vec{r}", r"\vec{r}", "wektor położenia"),
    (r"\vec{r}_i", r"\vec{r}_i", "położenie i-tego punktu"),
    (r"\vec{r}_{\mathrm{SM}}", r"\vec{r}_{\mathrm{SM}}", "położenie środka masy"),
    (r"\vec{p}", r"\vec{p}", "wektor pędu"),
    (r"\vec{a}", r"\vec{a}", "wektor przyspieszenia"),
    (r"\vec{F}", r"\vec{F}", "wektor siły"),
    (r"\vec{L}", r"\vec{L}", "wektor momentu pędu"),
    (r"\vec{E}", r"\vec{E}", "wektor natężenia pola elektrycznego"),
    (r"\vec{B}", r"\vec{B}", "wektor indukcji magnetycznej"),
    (r"\vec{S}", r"\vec{S}", "wektor powierzchni pętli"),
    (r"\vec{F}_e", r"\vec{F}_e", "siła elektryczna na ładunek"),
    (r"\sigma T^4", r"\sigma", "stała Stefana–Boltzmanna (promieniowanie ciała doskonale czarnego)"),
    (r"\dfrac{\sigma}{\varepsilon_0}", r"\sigma", "gęstość ładunku powierzchniowego na okładce"),
    (r"\Delta t", r"\Delta t", "przyrost czasu"),
    (r"\Delta h", r"\Delta h", "różnica wysokości"),
    (r"\Delta E_p", r"\Delta E_p", "zmiana energii potencjalnej"),
    (r"\Delta p", r"\Delta p", "różnica ciśnień"),
    (r"\Delta S", r"\Delta S", "pole zakreślone przez promień wodzący"),
    (r"\Delta Q", r"\Delta Q", "przyrost ładunku"),
    (r"\Delta V", r"\Delta V", "zmiana objętości"),
    (r"\Delta T", r"\Delta T", "zmiana temperatury"),
    (r"\Delta U", r"\Delta U", "zmiana energii wewnętrnej"),
    (r"\Delta \omega", r"\Delta \omega", "przyrost prędkości kątowej"),
    (r"\Delta \alpha", r"\Delta \alpha", "przyrost kąta obrotu"),
    (r"\Delta \Phi_B", r"\Delta \Phi_B", "przyrost strumienia magnetycznego"),
    (r"\varepsilon_0", r"\varepsilon_0", "przenikalność elektryczna próżni"),
    (r"\varepsilon_r", r"\varepsilon_r", "względna przenikalność dielektryka"),
    (r"\varepsilon", r"\varepsilon", "przyspieszenie kątowe (oznaczenie CKE)"),
    (r"\varphi_0", r"\varphi_0", "faza początkowa"),
    (r"\varphi(t)", r"\varphi(t)", "faza w funkcji czasu"),
    (r"\varphi_2", r"\varphi_2", "faza drugiej fali"),
    (r"\varphi_1", r"\varphi_1", "faza pierwszej fali"),
    (r"\omega t", r"\omega t", "kąt fazowy (argument sin/cos)"),
    (r"\omega", r"\omega", "częstość kątowa"),
    (r"\lambda_{\max}", r"\lambda_{\max}", "długość fali maksymalnej emisji (Wien)"),
    (r"\lambda", r"\lambda", "długość fali"),
    (r"\alpha_{2\,\mathrm{gr}}", r"\alpha_{2\,\mathrm{gr}}", "kąt graniczny w ośrodku 2"),
    (r"\alpha_{\mathrm{pad}\,1}", r"\alpha_{\mathrm{pad}\,1}", "kąt padania w ośrodku 1"),
    (r"\alpha_{\mathrm{zał}\,2}", r"\alpha_{\mathrm{zał}\,2}", "kąt załamania w ośrodku 2"),
    (r"\alpha_n", r"\alpha_n", "kąt dla rzędu dyfrakcji n"),
    (r"\alpha_1", r"\alpha_1", "kąt w ośrodku 1"),
    (r"\alpha_2", r"\alpha_2", "kąt w ośrodku 2"),
    (r"f_{\mathrm{ob}}", r"f_{\mathrm{ob}}", "częstotliwość obserwowana"),
    (r"f_{\mathrm{źr}}", r"f_{\mathrm{źr}}", "częstotliwość źródła"),
    (r"v_{\mathrm{ob}}", r"v_{\mathrm{ob}}", "prędkość obserwatora względem ośrodka"),
    (r"v_{\mathrm{źr}}", r"v_{\mathrm{źr}}", "prędkość źródła względem ośrodka"),
    (r"v_{\mathrm{or}}", r"v_{\mathrm{or}}", "prędkość na orbicie kołowej"),
    (r"v_d", r"v_d", "prędkość fali w ośrodku (np. dźwięku)"),
    (r"v_u", r"v_u", "prędkość ucieczki"),
    (r"v_0", r"v_0", "prędkość początkowa (skalar)"),
    (r"v_1", r"v_1", "prędkość fali w ośrodku 1"),
    (r"v_2", r"v_2", "prędkość fali w ośrodku 2"),
    (r"a_{\mathrm{do}}", r"a_{\mathrm{do}}", "przyspieszenie dośrodkowe"),
    (r"a_{\mathrm{st}}", r"a_{\mathrm{st}}", "przyspieszenie styczne"),
    (r"a_g", r"a_g", "przyspieszenie grawitacyjne (wartość pola)"),
    (r"a(t)", r"a(t)", "przyspieszenie w funkcji czasu"),
    (r"x_{\max}", r"x_{\max}", "maksymalne wychylenie od równowagi"),
    (r"x(t)", r"x(t)", "położenie od równowagi w czasie"),
    (r"E_{\mathrm{kin\,el\,max}}", r"E_{\mathrm{kin\,el\,max}}", "maks. energia kinetyczna elektronu"),
    (r"W_{\mathrm{el}}", r"W_{\mathrm{el}}", "praca wyjścia elektronu z metalu"),
    (r"E_{\mathrm{odrzutu}}", r"E_{\mathrm{odrzutu}}", "energia odrzutu / rekoiłu"),
    (r"E_{\mathrm{kin}}", r"E_{\mathrm{kin}}", "energia kinetyczna"),
    (r"E_{\mathrm{pot}}", r"E_{\mathrm{pot}}", "energia potencjalna"),
    (r"E_{\mathrm{śr}}", r"E_{\mathrm{śr}}", "średnia energia kinetyczna cząsteczki"),
    (r"E_f", r"E_f", "energia fotonu"),
    (r"E_n", r"E_n", "energia poziomu n w wodorze"),
    (r"E_m", r"E_m", "energia poziomu m w atomie"),
    (r"E_0", r"E_0", "energia spoczynkowa lub amplituda (z kontekstu wzoru)"),
    (r"E_k", r"E_k", "energia kinetyczna (składowa oscylatora)"),
    (r"E_p", r"E_p", "energia potencjalna (składowa oscylatora)"),
    (r"F_{\mathrm{wyp}}", r"F_{\mathrm{wyp}}", "siła wyporu"),
    (r"F_g", r"F_g", "siła grawitacji"),
    (r"F_h", r"F_h", "siła harmoniczna"),
    (r"F_s", r"F_s", "siła sprężystości"),
    (r"F_e", r"F_e", "wartość siły elektrycznej (Coulomb)"),
    (r"T_k", r"T_k", "siła tarcia kinetycznego"),
    (r"T_s", r"T_s", "siła tarcia statycznego"),
    (r"F_N", r"F_N", "siła nacisku prostopadła do powierzchni"),
    (r"W_F", r"W_F", "praca siły"),
    (r"W_M", r"W_M", "praca momentu siły"),
    (r"W_{AB}", r"W_{AB}", "praca od A do B"),
    (r"W_{\mathrm{calk}}", r"W_{\mathrm{calk}}", "suma prac w cyklu"),
    (r"Q_{\mathrm{calk}}", r"Q_{\mathrm{calk}}", "suma ciepła w cyklu"),
    (r"Q_{\mathrm{pob}}", r"Q_{\mathrm{pob}}", "ciepło pobrane z gorącego źródła"),
    (r"Q_{\mathrm{odd}}", r"Q_{\mathrm{odd}}", "ciepło oddane do zimnego źródła"),
    (r"U_{AB}", r"U_{AB}", "napięcie między A i B"),
    (r"V_{\mathrm{zan}}", r"V_{\mathrm{zan}}", "objętość zanurzonej części ciała"),
    (r"V_B", r"V_B", "potencjał elektryczny w punkcie B"),
    (r"V_A", r"V_A", "potencjał elektryczny w punkcie A"),
    (r"C_V", r"C_V", "ciepło molowe przy V=const"),
    (r"C_p", r"C_p", "ciepło molowe przy p=const"),
    (r"T_1^2", r"T_1", "okres obiegu ciała 1"),
    (r"T_2^2", r"T_2", "okres obiegu ciała 2"),
    (r"a_1^3", r"a_1", "półoś wielka / promień orbity — ciało 1"),
    (r"a_2^3", r"a_2", "półoś wielka / promień orbity — ciało 2"),
    (r"m_1", r"m_1", "masa pierwszego ciała"),
    (r"m_2", r"m_2", "masa drugiego ciała"),
    (r"m_i", r"m_i", "masa i-tego punktu"),
    (r"r_i", r"r_i", "odległość i-tej cząstki od osi obrotu"),
    (r"q_1", r"q_1", "ładunek pierwszy"),
    (r"q_2", r"q_2", "ładunek drugi"),
    (r"R_1", r"R_1", "promień krzywizny pierwszej powierzchni soczewki"),
    (r"R_2", r"R_2", "promień krzywizny drugiej powierzchni"),
    (r"R_z", r"R_z", "opór zastępczy"),
    (r"R_w", r"R_w", "opór wewnętrzny źródła"),
    (r"R_i", r"R_i", "opór i-tego opornika"),
    (r"N_1", r"N_1", "liczba zwojów uzwojenia pierwszego"),
    (r"N_2", r"N_2", "liczba zwojów uzwojenia drugiego"),
    (r"I_1", r"I_1", "prąd strony pierwszej transformatora"),
    (r"I_2", r"I_2", "prąd strony drugiej transformatora"),
    (r"U_1", r"U_1", "napięcie strony pierwszej transformatora"),
    (r"U_2", r"U_2", "napięcie strony drugiej transformatora"),
    (r"I_0", r"I_0", "amplituda prądu sinusoidalnego"),
    (r"U_0", r"U_0", "amplituda napięcia sinusoidalnego"),
    (r"I_{\mathrm{sk}}", r"I_{\mathrm{sk}}", "natężenie skuteczne"),
    (r"U_{\mathrm{sk}}", r"U_{\mathrm{sk}}", "napięcie skuteczne"),
    (r"n_{\mathrm{socz}}", r"n_{\mathrm{socz}}", "współczynnik załamania soczewki"),
    (r"n_{\mathrm{otocz}}", r"n_{\mathrm{otocz}}", "współczynnik załamania ośrodka zewnętrznego"),
    (r"n_1", r"n_1", "współczynnik załamania ośrodka 1"),
    (r"n_2", r"n_2", "współczynnik załamania ośrodka 2"),
    (r"d \sin", r"d", "stała siatki dyfrakcyjnej"),
    (r"p V = n", r"n", "liczba moli gazu"),
    (r"n \lambda", r"n", "rząd dyfrakcji (liczba całkowita)"),
    (r"c_w", r"c_w", "ciepło właściwe"),
    (r"M_Z", r"M_Z", "masa Ziemi"),
    (r"M_S", r"M_S", "masa Słońca"),
    (r"R_Z", r"R_Z", "promień równikowy Ziemi"),
    (r"R_0", r"R_0", "odległość Słońca od centrum Galaktyki (szacunek)"),
    (r"H_0", r"H_0", "stała Hubble'a"),
    (r"m_e", r"m_e", "masa elektronu"),
    (r"m_p", r"m_p", "masa protonu"),
    (r"m_n", r"m_n", "masa neutronu"),
    (r"N_0", r"N_0", "liczba jąder w chwili początkowej"),
    (r"N(t)", r"N(t)", "liczba nierozpadłych jąder w czasie t"),
    (r"\mathcal{E}", r"\mathcal{E}", "siła elektromotoryczna (SEM)"),
    (r"\Phi_B", r"\Phi_B", "strumień magnetyczny"),
    (r"\mu_0", r"\mu_0", "przenikalność magnetyczna próżni"),
    (r"\mu_k", r"\mu_k", "współczynnik tarcia kinetycznego"),
    (r"\mu_s", r"\mu_s", "współczynnik tarcia statycznego"),
    (r"\eta", r"\eta", "sprawność silnika cieplnego"),
    (r"\gamma", r"\gamma", "natężenie pola grawitacyjnego"),
    (r"\mathrm{const}", r"\mathrm{const}", "wielkość stała w danym zjawisku"),
    (r"k_B", r"k_B", "stała Boltzmanna"),
    (r"\dfrac{G M", r"M", "masa centralnego ciała (np. gwiazdy, planety)"),
    (r"\sqrt{2 G M", r"M", "masa centralnego ciała"),
    (r"N B S \omega", r"N", "liczba zwojów cewki w prądnicy"),
    (r"-\dfrac{\Delta \Phi_B", r"\mathcal{E}", "SEM z indukcji elektromagnetycznej"),
    (r"\dfrac{\mu_0 N I}{L}", r"L", "długość zwojnicy"),
    (r"\rho \dfrac{\ell}{S}", r"\rho", "opór właściwy materiału"),
    (r"\rho\, V_{\mathrm{zan}}", r"\rho", "gęstość ośrodka płynnego"),
    (r"\rho g \Delta h", r"\rho", "gęstość cieczy lub gazu"),
    (r"\dfrac{m_1 m_2", r"G", "stała grawitacji"),
    (r"\dfrac{1}{4\pi \varepsilon_0}", r"k", "stała elektrostatyczna Coulomba"),
    (r"k \dfrac{q", r"k", "stała elektrostatyczna"),
    (r"\dfrac{Q^2}{2C}", r"Q", "ładunek na okładkach kondensatora"),
    (r"4\pi \cdot 10^{-7}", r"\mu_0", "przenikalność magnetyczna próżni"),
    (r"8{,}854", r"\varepsilon_0", "przenikalność elektryczna próżni"),
    (r"8{,}987", r"k", "stała elektrostatyczna"),
    (r"\dfrac{h c}{\lambda}", r"h", "stała Plancka"),
    (r"h f", r"h", "stała Plancka"),
    (r"\dfrac{h}{p}", r"h", "stała Plancka"),
    (r"p V = n R T", r"R", "uniwersalna stała gazowa"),
    (r"C_p = C_V + R", r"R", "uniwersalna stała gazowa"),
    (r"\ell", r"\ell", "długość wahadła matematycznego"),
    (r"\angle(", r"\angle", "kąt między wektorami zapisanymi w nawiasie"),
    (r"\propto", r"\propto", "proporcjonalność (współczynnik pominięty)"),
]


def dedupe(entries):
    seen = set()
    out = []
    for tex, desc in entries:
        key = tex.strip()
        if key in seen:
            continue
        seen.add(key)
        out.append([tex, desc])
    return out


# Separator między symbolami w polu „tex” z wpisów MORE (LaTeX: przecinek + cienka spacja \,).
_COMPOUND_TEX_SEP = r",\,"


def expand_compound_legend_rows(rows):
    """Rozbija wpisy typu „C,\\,Q,\\,n” + „opis1; opis2; …” na osobne pary [symbol, znaczenie]."""
    out = []
    for tex, desc in rows:
        if _COMPOUND_TEX_SEP in tex and ";" in desc:
            parts_tex = [p.strip() for p in tex.split(_COMPOUND_TEX_SEP) if p.strip()]
            parts_desc = [p.strip() for p in desc.split(";") if p.strip()]
            if len(parts_tex) >= 2 and len(parts_tex) == len(parts_desc):
                for t, d in zip(parts_tex, parts_desc):
                    out.append([t, d])
                continue
        out.append([tex, desc])
    return out


def catalog_legend(back):
    hits = []
    for frag, tex, desc in CATALOG:
        if frag in back:
            hits.append([tex, desc])
    return dedupe(hits)


def manual_extra(topic, front, back):
    key = (topic, front)
    extra = {
        ("Drgania, fale mechaniczne i świetlne", "Siatka dyfrakcyjna"): [[r"n", "rząd dyfrakcji (liczba całkowita)"]],
        ("Podstawowe jednostki SI", "Siedem jednostek podstawowych"): [
            [
                r"\text{SI}",
                "m, kg, s, A, K, mol, cd — jednostki podstawowe układu SI (jak w informatorze)",
            ]
        ],
        ("Przedrostki jednostek miar", "Nazwy i oznaczenia (wybrane)"): [
            [r"\text{SI}", "przedrostki dziesiętne od jotta (Y) do jokta (y)"]
        ],
        ("Elementy fizyki atomowej i jądrowej", "Zasady zachowania (wybrane, poziom fundamentalny)"): [
            [
                r"\text{zasady}",
                "zachowanie ładunku, energii, pędu i liczby nukleonów w układzie izolowanym",
            ]
        ],
        ("Wybrane zależności", "Dodawanie i odejmowanie wektorów (konstrukcje)"): [
            [
                r"\vec{V}_1,\,\vec{V}_2",
                "wektory składane — równoległobok, trójkąt, składowe w układzie",
            ]
        ],
    }.get(key)
    return extra or []


def build_legend(card):
    rows = catalog_legend(card["back"]) + manual_extra(card["topic"], card["front"], card["back"])
    rows = expand_compound_legend_rows(rows)
    return dedupe(rows)


def main():
    text = SRC.read_text(encoding="utf-8")
    cards = parse_cards(text)
    obj = {}
    for c in cards:
        k = SEP.join([c["topic"].strip(), c["front"].strip()])
        obj[k] = build_legend(c)

    lines = [
        "/**",
        " * Legenda symboli pod fiszkami (wzory z data/fiszki-wzory.json — pole `name` = `front` w js/app.js).",
        " * Klucz mapy: trim(topic) + '\\x1e' + trim(name) — ten sam łańcuch co sheetSymbolLegendKey(topic, front) w js/app.js.",
        " * Generowanie: python tools/gen_wzory_symbol_legends.py",
        " */",
        "(function () {",
        "  \"use strict\";",
        "  window.__WZORY_SYMBOL_LEGEND__ = " + json.dumps(obj, ensure_ascii=False, indent=2) + ";",
        "})();",
        "",
    ]
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("written", OUT, "keys", len(obj), "cards parsed", len(cards))


if __name__ == "__main__":
    main()
