# -*- coding: utf-8 -*-
"""Wyczyść zadania i dodaj po 1 prostym zadaniu na sekcję (nowy schemat)."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "zadania.json"

TYPES = ("math", "abcd", "open")


def make_open(title, question, answer, steps, formulas=None):
    return {
        "title": title,
        "difficulty": 1,
        "taskType": "open",
        "question": question,
        "answer": answer,
        "solutionSteps": steps,
        "formulas": formulas or [],
    }


def make_math(title, question, answer, math_value, math_unit, steps, formulas=None):
    return {
        "title": title,
        "difficulty": 1,
        "taskType": "math",
        "question": question,
        "answer": answer,
        "mathValue": str(math_value),
        "mathUnit": math_unit,
        "solutionSteps": steps,
        "formulas": formulas or [],
    }


def make_abcd(title, question, answer, options, steps, formulas=None):
    return {
        "title": title,
        "difficulty": 1,
        "taskType": "abcd",
        "question": question,
        "answer": answer,
        "abcdOptions": options,
        "solutionSteps": steps,
        "formulas": formulas or [],
    }


# Opcjonalne nadpisania pojedynczych typów (klucz sekcji → math|abcd|open → zadanie)
CUSTOM: dict[str, dict[str, dict]] = {
    "praca-moc-energia": {
        "math": make_math(
            "Praca siły",
            "Siła $F = 20\\,\\text{N}$ przesuwa ciało na drodze $s = 5\\,\\text{m}$ w kierunku siły. Oblicz pracę.",
            "$W = 100\\,\\text{J}$",
            "100",
            "J",
            ["$W = F \\cdot s = 20 \\cdot 5 = 100\\,\\text{J}$."],
            ["W = F \\cdot s"],
        ),
    },
    "lo1-ruch-jednostajny": {
        "math": make_math(
            "Droga w RJ",
            "Ciało porusza się ruchem jednostajnym z $v = 10\\,\\text{m/s}$ przez $t = 12\\,\\text{s}$. Oblicz drogę $s$.",
            "$s = 120\\,\\text{m}$",
            "120",
            "m",
            ["$s = v \\cdot t = 10 \\cdot 12 = 120\\,\\text{m}$."],
            ["s = v \\cdot t"],
        ),
    },
    "lo1-newton": {
        "abcd": make_abcd(
            "II zasada",
            "Masa $m = 3\\,\\text{kg}$, przyspieszenie $a = 2\\,\\text{m/s}^2$. Który wzór daje siłę wypadkową?",
            "$F = 6\\,\\text{N}$",
            [
                {"text": "$F = m \\cdot a$", "isCorrect": True},
                {"text": "$F = m / a$", "isCorrect": False},
                {"text": "$F = m + a$", "isCorrect": False},
                {"text": "$F = m \\cdot g$ tylko", "isCorrect": False},
            ],
            ["$F = m \\cdot a = 3 \\cdot 2 = 6\\,\\text{N}$."],
            ["F = m \\cdot a"],
        ),
    },
    "lo-rz-k3-prad-1": {
        "math": make_math(
            "Prawo Ohma",
            "Opór $R = 8\\,\\Omega$, prąd $I = 0{,}25\\,\\text{A}$. Oblicz napięcie $U$.",
            "$U = 2\\,\\text{V}$",
            "2",
            "V",
            ["$U = I \\cdot R = 0{,}25 \\cdot 8 = 2\\,\\text{V}$."],
            ["U = I \\cdot R"],
        ),
    },
    "lo-rz-k1-hyd-3": {
        "math": make_math(
            "Siła wyporu",
            "Ciało o objętości $V = 0{,}5\\,\\text{m}^3$ jest zanurzone w wodzie ($\\rho = 1000\\,\\text{kg/m}^3$). Oblicz siłę wyporu. $g = 10\\,\\text{m/s}^2$.",
            "$F_w = 5000\\,\\text{N}$",
            "5000",
            "N",
            [
                "$F_w = \\rho \\cdot g \\cdot V$.",
                "$F_w = 1000 \\cdot 10 \\cdot 0{,}5 = 5000\\,\\text{N}$.",
            ],
            ["F_w = \\rho g V"],
        ),
    },
    "wstep-sp": {
        "open": make_open(
            "Jednostka siły",
            "Jaka jest podstawowa jednostka siły w układzie SI?",
            "Newton ($\\text{N}$).",
            ["Siła w SI mierzymy w newtonach: $1\\,\\text{N} = 1\\,\\text{kg}\\cdot\\text{m/s}^2$."],
        ),
    },
}


def match_topic(sid: str, title: str) -> str:
    s = (sid + " " + title).lower()
    if re.search(r"ruch|kinemat|jednostaj|przemiesz", s):
        return "kinematyka"
    if re.search(r"dyn|newton|sił|tarcie|ped|impuls", s):
        return "dynamika"
    if re.search(r"prac|moc|energ|zderz", s):
        return "energia"
    if re.search(r"hyd|archimed|pascal|ciśn", s):
        return "hydro"
    if re.search(r"obrot|moment|brył", s):
        return "obrot"
    if re.search(r"graw|kepler|satelit|kosmicz", s):
        return "grawitacja"
    if re.search(r"termo|gaz|ciep", s):
        return "termo"
    if re.search(r"elek|ładun|coulomb|kondens|potencjał", s):
        return "elektrostatyka"
    if re.search(r"prąd|prad|ohm|kirch|oporn", s):
        return "prad"
    if re.search(r"magn|induk|faraday|transform", s):
        return "magnetyzm"
    if re.search(r"fal|drg|dźwięk|akust", s):
        return "fale"
    if re.search(r"opt|świat|soczew|odbic", s):
        return "optyka"
    if re.search(r"kwant|foton|fotoelek|compton", s):
        return "kwantowa"
    if re.search(r"jądr|jadro|rozpad|promienio|izotop", s):
        return "jadrowa"
    if re.search(r"einstein|relatyw|dylatac|kontrakc", s):
        return "relatywistyczna"
    if re.search(r"wektor", s):
        return "wektory"
    return "ogolne"


def topic_task(topic: str, section_title: str, level_title: str, kind: str):
    short = section_title if len(section_title) < 55 else section_title[:52] + "…"
    prefix = f"**{short}** ({level_title})\n\n"
    bank = {
        "kinematyka": {
            "math": (
                "Prędkość i droga",
                f"W dziale *{short}* ciało ma $v = 5\\,\\text{{m/s}}$ i porusza się $t = 8\\,\\text{{s}}$. Oblicz drogę.",
                "$s = 40\\,\\text{m}$",
                "40",
                "m",
                ["$s = v \\cdot t = 5 \\cdot 8 = 40\\,\\text{m}$."],
                ["s = v \\cdot t"],
            ),
            "abcd": (
                "RJ — definicja",
                f"Które stwierdzenie opisuje ruch jednostajny prostoliniowy?",
                "Prędkość stała, droga rośnie liniowo z czasem.",
                [
                    {"text": "Prędkość jest stała, a droga rośnie proporcjonalnie do czasu.", "isCorrect": True},
                    {"text": "Przyspieszenie rośnie liniowo z czasem.", "isCorrect": False},
                    {"text": "Droga jest zawsze równa zero.", "isCorrect": False},
                    {"text": "Prędkość jest równa przyspieszeniu.", "isCorrect": False},
                ],
                ["W RJ $a = 0$ i $v = \\text{const}$."],
            ),
            "open": (
                "Opis ruchu",
                f"Krótko opisz, czym różni się **droga** od **przemieszczenia** (dział: {short}).",
                "Droga to długość toru; przemieszczenie to wektor od położenia początkowego do końcowego.",
                [
                    "Droga zależy od toru i może być większa od wartości przemieszczenia.",
                    "Przemieszczenie ma kierunek i zwrot (wielkość wektorowa).",
                ],
            ),
        },
        "dynamika": {
            "math": (
                "Siła wypadkowa",
                "Oblicz siłę dla $m = 4\\,\\text{kg}$, $a = 2{,}5\\,\\text{m/s}^2$.",
                "$F = 10\\,\\text{N}$",
                "10",
                "N",
                ["$F = m \\cdot a = 4 \\cdot 2{,}5 = 10\\,\\text{N}$."],
                ["F = m \\cdot a"],
            ),
            "abcd": (
                "Zasada bezwładności",
                "Które zdanie odnosi się do I zasady dynamiki?",
                "Ciało pozostaje w spoczynku lub RJ, jeśli siła wypadkowa jest zerowa.",
                [
                    {"text": "Przy zerowej sile wypadkowej ciało nie zmienia stanu ruchu.", "isCorrect": True},
                    {"text": "Siła zawsze równa się iloczynowi masy i przyspieszenia ziemskiego.", "isCorrect": False},
                    {"text": "Akcja i reakcja działają na to samo ciało.", "isCorrect": False},
                    {"text": "Pęd zawsze rośnie w czasie.", "isCorrect": False},
                ],
                ["I zasada — bezwładność."],
            ),
            "open": (
                "III zasada",
                "Podaj treść III zasady dynamiki Newtona i krótki przykład z życia.",
                "Siły akcji i reakcji mają równe wartości, przeciwne kierunki i działają na różne ciała.",
                ["Np. Ziemia przyciąga ciało, ciało przyciąga Ziemię tą samą wartością siły."],
            ),
        },
        "energia": {
            "math": (
                "Praca mechaniczna",
                "Siła $F = 50\\,\\text{N}$, droga $s = 4\\,\\text{m}$ w kierunku siły. Oblicz pracę.",
                "$W = 200\\,\\text{J}$",
                "200",
                "J",
                ["$W = F \\cdot s = 50 \\cdot 4 = 200\\,\\text{J}$."],
                ["W = F \\cdot s"],
            ),
            "abcd": (
                "Jednostka mocy",
                "Jaka jest jednostka mocy w SI?",
                "Wat (W).",
                [
                    {"text": "Wat (W)", "isCorrect": True},
                    {"text": "Dżul na sekundę zapisany jako J·s", "isCorrect": False},
                    {"text": "Newton (N)", "isCorrect": False},
                    {"text": "Wolt (V)", "isCorrect": False},
                ],
                ["$1\\,\\text{W} = 1\\,\\text{J/s}$."],
            ),
            "open": (
                "Zasada zachowania energii",
                f"Wyjaśnij w jednym akapicie ideę zachowania energii mechanicznej (kontekst: {short}).",
                "Suma energii kinetycznej i potencjalnej pozostaje stała, gdy nie ma strat na tarcie itp.",
                ["W idealnym układzie zamkniętym energia nie znika — zmienia postać."],
            ),
        },
        "hydro": {
            "math": (
                "Ciśnienie hydrostatyczne",
                "Oblicz ciśnienie na głębokości $h = 2\\,\\text{m}$ w wodzie ($\\rho = 1000\\,\\text{kg/m}^3$, $g = 10\\,\\text{m/s}^2$).",
                "$p = 20000\\,\\text{Pa}$",
                "20000",
                "Pa",
                ["$p = \\rho g h = 1000 \\cdot 10 \\cdot 2 = 20000\\,\\text{Pa}$."],
                ["p = \\rho g h"],
            ),
            "abcd": (
                "Prawo Archimedesa",
                "Co opisuje prawo Archimedesa?",
                "Siła wyporu równa ciężarowi wypartego płynu.",
                [
                    {"text": "Siła wyporu równa ciężarowi wypartego płynu.", "isCorrect": True},
                    {"text": "Ciśnienie nie zależy od głębokości.", "isCorrect": False},
                    {"text": "Ciało zawsze tonie w wodzie.", "isCorrect": False},
                    {"text": "Gęstość ciała nie wpływa na pływanie.", "isCorrect": False},
                ],
                ["Archimedes — wypór."],
            ),
            "open": (
                "Prawo Pascala",
                "Krótko opisz prawo Pascala i podaj przykład zastosowania.",
                "Zmiana ciśnienia w cieczy przekazywana jest w równym stopniu we wszystkich kierunkach; prasa hydrauliczna.",
                ["Nacisk na tłoczku małym przenosi się na tłoczek duży ze wzmocnieniem siły."],
            ),
        },
        "prad": {
            "math": (
                "Natężenie prądu",
                "Przez przewodnik w $t = 10\\,\\text{s}$ przepłynął ładunek $Q = 2\\,\\text{C}$. Oblicz natężenie $I$.",
                "$I = 0{,}2\\,\\text{A}$",
                "0.2",
                "A",
                ["$I = Q/t = 2/10 = 0{,}2\\,\\text{A}$."],
                ["I = Q / t"],
            ),
            "abcd": (
                "Prawo Ohma",
                "Która zależność jest prawem Ohma?",
                "$U = I \\cdot R$",
                [
                    {"text": "$U = I \\cdot R$", "isCorrect": True},
                    {"text": "$R = U \\cdot I$", "isCorrect": False},
                    {"text": "$I = U \\cdot R$", "isCorrect": False},
                    {"text": "$P = U / I$ zawsze", "isCorrect": False},
                ],
                ["Ohm: napięcie proporcjonalne do prądu przy stałej temperaturze."],
            ),
            "open": (
                "Obwód szeregowy",
                "Jak łączy się opór zastępczy dwóch oporników szeregowo?",
                "Opory się sumują: $R = R_1 + R_2$.",
                ["Prąd w szeregu jest taki sam, napięcia się sumują."],
            ),
        },
        "elektrostatyka": {
            "math": (
                "Ładunek z prądu",
                "Prąd $I = 0{,}5\\,\\text{A}$ płynie $t = 4\\,\\text{s}$. Oblicz przeniesiony ładunek $Q$.",
                "$Q = 2\\,\\text{C}$",
                "2",
                "C",
                ["$Q = I \\cdot t = 0{,}5 \\cdot 4 = 2\\,\\text{C}$."],
                ["Q = I \\cdot t"],
            ),
            "abcd": (
                "Jednostka ładunku",
                "Podstawowa jednostka ładunku elektrycznego w SI to:",
                "Kulomb (C).",
                [
                    {"text": "Kulomb (C)", "isCorrect": True},
                    {"text": "Amper (A)", "isCorrect": False},
                    {"text": "Wolt (V)", "isCorrect": False},
                    {"text": "Tesla (T)", "isCorrect": False},
                ],
                ["Ładunek w SI — kulomb."],
            ),
            "open": (
                "Linie pola",
                "Czym różnią się linie pola elektrycznego od linii pola magnetycznego?",
                "Linie E zaczynają się na + i kończą na −; linie B są zamknięte.",
                ["To uproszczony obraz geometryczny pola."],
            ),
        },
        "magnetyzm": {
            "math": (
                "Siła na przewodnik",
                "Przewodnik z prądem $I = 2\\,\\text{A}$ w polu $B = 0{,}5\\,\\text{T}$, długość $l = 0{,}2\\,\\text{m}$, kąt $90^\\circ$. Oblicz siłę $F$.",
                "$F = 0{,}2\\,\\text{N}$",
                "0.2",
                "N",
                ["$F = B \\cdot I \\cdot l = 0{,}5 \\cdot 2 \\cdot 0{,}2 = 0{,}2\\,\\text{N}$."],
                ["F = B I l \\sin\\alpha"],
            ),
            "abcd": (
                "Indukcja",
                "Zjawisko powstawania SEM w obwodzie przy zmianie strumienia magnetycznego to:",
                "Indukcja elektromagnetyczna (Faraday).",
                [
                    {"text": "Indukcja elektromagnetyczna", "isCorrect": True},
                    {"text": "Efekt fotoelektryczny", "isCorrect": False},
                    {"text": "Rezonans mechaniczny", "isCorrect": False},
                    {"text": "Rozpad promieniotwórczy", "isCorrect": False},
                ],
                ["Faraday — indukcja."],
            ),
            "open": (
                "Transformator",
                "Na czym polega działanie transformatora idealnego?",
                "Zmienia napięcie prądu przemiennego; stosunek zwojów decyduje o napięciu.",
                ["Energia przekazywana jest polem magnetycznym między uzwojeniami."],
            ),
        },
        "fale": {
            "math": (
                "Okres drgań",
                "Drganie ma częstotliwość $f = 5\\,\\text{Hz}$. Oblicz okres $T$.",
                "$T = 0{,}2\\,\\text{s}$",
                "0.2",
                "s",
                ["$T = 1/f = 1/5 = 0{,}2\\,\\text{s}$."],
                ["T = 1 / f"],
            ),
            "abcd": (
                "Fala mechaniczna",
                "Fala mechaniczna w ośrodku sprężystym to:",
                "Zaburzenie rozchodzące się wraz z energią.",
                [
                    {"text": "Rozchodzące się zaburzenie przenoszące energię", "isCorrect": True},
                    {"text": "Przepływ materii w jednym kierunku", "isCorrect": False},
                    {"text": "Wyłącznie ruch jednostajny", "isCorrect": False},
                    {"text": "Zawsze fala poprzeczna", "isCorrect": False},
                ],
                ["Fala — energia bez przepływu materii (w przybliżeniu)."],
            ),
            "open": (
                "Efekt Dopplera",
                "Krótko opisz efekt Dopplera dla dźwięku.",
                "Obserwator słyszy wyższą częstotliwość, gdy źródło się zbliża.",
                ["Zmiana obserwowanej częstotliwości przy względnym ruchu źródła i odbiorcy."],
            ),
        },
        "optyka": {
            "math": (
                "Ogniskowa soczewka",
                "Soczewka ma ogniskową $f = 0{,}25\\,\\text{m}$, przedmiot w odległości $u = 0{,}5\\,\\text{m}$. Oblicz $1/v$ używając $1/f = 1/u + 1/v$ — podaj $v$ w metrach.",
                "$v = 0{,}5\\,\\text{m}$",
                "0.5",
                "m",
                ["$1/v = 1/f - 1/u = 4 - 2 = 2$, więc $v = 0{,}5\\,\\text{m}$."],
                ["\\dfrac{1}{f} = \\dfrac{1}{u} + \\dfrac{1}{v}"],
            ),
            "abcd": (
                "Odbicie",
                "Kąt padania promienia światła na zwierciadle równy jest:",
                "Kątowi odbicia.",
                [
                    {"text": "Kątowi odbicia", "isCorrect": True},
                    {"text": "Połowie kąta załamania", "isCorrect": False},
                    {"text": "Zawsze $0^\\circ$", "isCorrect": False},
                    {"text": "Kątowi krytycznemu", "isCorrect": False},
                ],
                ["Prawo odbicia — kąty padania i odbicia względem normalnej."],
            ),
            "open": (
                "Interferencja",
                "Co to jest interferencja światła?",
                "Superpozycja fal prowadząca do wzmocnień i wygaszeń.",
                ["Np. obserwowana w doświadczeniu Younga."],
            ),
        },
        "kwantowa": {
            "math": (
                "Energia fotonu",
                "Foton ma częstotliwość $f = 6 \\cdot 10^{14}\\,\\text{Hz}$. Oblicz energię ($h = 6{,}6 \\cdot 10^{-34}\\,\\text{J·s}$) w $10^{-19}\\,\\text{J}$ (podaj liczbę w tych jednostkach, np. 4).",
                "$E \\approx 4 \\cdot 10^{-19}\\,\\text{J}$",
                "4",
                "×10⁻¹⁹ J",
                ["$E = h f \\approx 6{,}6\\cdot10^{-34} \\cdot 6\\cdot10^{14} \\approx 4\\cdot10^{-19}\\,\\text{J}$."],
                ["E = h f"],
            ),
            "abcd": (
                "Fotoefekt",
                "W fotoefekcie zewnętrznym kluczowe jest:",
                "Energia fotonu musi przekroczyć pracę wyjścia.",
                [
                    {"text": "Energia fotonu zależy od częstotliwości światła", "isCorrect": True},
                    {"text": "Natężenie światła zmienia częstotliwość fotonów", "isCorrect": False},
                    {"text": "Prąd rośnie bez progu częstotliwości", "isCorrect": False},
                    {"text": "Elektron nie absorbuje energii", "isCorrect": False},
                ],
                ["Einstein — kwant światła."],
            ),
            "open": (
                "Dualizm",
                "Co oznacza dualizm korpuskularno-falowy?",
                "Światło i materia wykazują zarówno właściwości falowe, jak i cząstkowe.",
                ["Np. foton ma energię i pęd jak cząstka, ale interferuje jak fala."],
            ),
        },
        "jadrowa": {
            "math": (
                "Liczba neutronów",
                "Jądro ma liczbę masową $A = 14$ i protonów $Z = 6$. Ile neutronów $N$?",
                "$N = 8$",
                "8",
                "",
                ["$N = A - Z = 14 - 6 = 8$."],
                ["N = A - Z"],
            ),
            "abcd": (
                "Promieniotwórczość",
                "Promieniowanie gamma to:",
                "Fala elektromagnetyczna o wysokiej energii.",
                [
                    {"text": "Fala elektromagnetyczna (foton wysokiej energii)", "isCorrect": True},
                    {"text": "Emisja elektronu z jądra", "isCorrect": False},
                    {"text": "Emisja helu (alfa)", "isCorrect": False},
                    {"text": "Spadek temperatury ośrodka", "isCorrect": False},
                ],
                ["Gamma — promieniowanie elektromagnetyczne."],
            ),
            "open": (
                "Izotopy",
                "Czym różnią się izotopy tego samego pierwiastka?",
                "Mają tę samą liczbę protonów, inną liczbę neutronów (masę jądra).",
                ["Np. węgiel-12 i węgiel-14."],
            ),
        },
        "termo": {
            "math": (
                "Skala Kelvina",
                "Temperatura wynosi $t = 27\\,^\\circ\\text{C}$. Oblicz temperaturę w kelwinach $T$.",
                "$T = 300\\,\\text{K}$",
                "300",
                "K",
                ["$T = t + 273{,}15 \\approx 27 + 273 = 300\\,\\text{K}$."],
                ["T = t + 273{,}15"],
            ),
            "abcd": (
                "Gaz doskonały",
                "Równanie Clapeyrona ma postać:",
                "$p V = n R T$",
                [
                    {"text": "$p V = n R T$", "isCorrect": True},
                    {"text": "$p = m g h$", "isCorrect": False},
                    {"text": "$Q = m c \\Delta T$ zawsze dla gazu", "isCorrect": False},
                    {"text": "$F = m a$", "isCorrect": False},
                ],
                ["Clapeyron — gaz doskonały."],
            ),
            "open": (
                "II zasada termodynamiki",
                "Sformułuj sens II zasady termodynamiki (uproszczenie).",
                "Procesy samorzutne zwiększają entropię układu izolowanego.",
                ["Ciepło nie przepływa samo z ciała zimniejszego na gorętsze."],
            ),
        },
        "grawitacja": {
            "math": (
                "Siła grawitacji",
                "Oblicz siłę grawitacji między $m_1 = m_2 = 1\\,\\text{kg}$ w odległości $r = 1\\,\\text{m}$ ($G = 6{,}67 \\cdot 10^{-11}\\,\\text{N·m}^2/\\text{kg}^2$). Podaj wynik w $10^{-11}\\,\\text{N}$.",
                "$F \\approx 6{,}67 \\cdot 10^{-11}\\,\\text{N}$",
                "6.67",
                "×10⁻¹¹ N",
                ["$F = G m_1 m_2 / r^2 = 6{,}67\\cdot10^{-11}\\,\\text{N}$."],
                ["F = G \\dfrac{m_1 m_2}{r^2}"],
            ),
            "abcd": (
                "Kepler",
                "II prawo Keplera dotyczy:",
                "Równych pól w równych czasach (szybszy ruch bliżej Słońca).",
                [
                    {"text": "Promień wektorowy wymyka równe pola w równych czasach", "isCorrect": True},
                    {"text": "Kwadrat okresu proporcjonalny do sześcianu promienia", "isCorrect": False},
                    {"text": "Orbit są prostymi liniami", "isCorrect": False},
                    {"text": "Grawitacja nie istnieje", "isCorrect": False},
                ],
                ["Kepler II — pola."],
            ),
            "open": (
                "Stan nieważkości",
                "Czym jest stan nieważkości na orbicie?",
                "Brak odczuwalnego ciężaru przy swobodnym opadaniu wraz z satelitą.",
                ["Astronauta i statek mają to samo przyspieszenie w kierunku Ziemi."],
            ),
        },
    }

    default = bank.get(topic, bank["dynamika"])
    spec = default[kind]
    if kind == "math":
        t = make_math(*spec)
    elif kind == "abcd":
        t = make_abcd(*spec)
    else:
        t = make_open(*spec)
    if not str(t.get("question", "")).startswith("**"):
        t["question"] = prefix + t["question"]
    return t


def tasks_for_section(section: dict, level: dict) -> list:
    """Po jednym zadaniu math, abcd i open na sekcję (rozdział)."""
    sid = section["id"]
    topic = match_topic(sid, section["title"])
    title = section["title"]
    level_title = level["title"]
    overrides = CUSTOM.get(sid, {})
    tasks = []
    for kind in TYPES:
        if kind in overrides:
            tasks.append(overrides[kind])
        else:
            tasks.append(topic_task(topic, title, level_title, kind))
    return tasks


def main():
    data = json.loads(OUT.read_text(encoding="utf-8"))
    sections_n = 0
    stats = {"open": 0, "math": 0, "abcd": 0}
    for level in data["levels"]:
        for section in level.get("sections", []):
            section["tasks"] = tasks_for_section(section, level)
            sections_n += 1
            for t in section["tasks"]:
                stats[t["taskType"]] += 1
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sections_n * 3
    print(f"Zapisano {sections_n} sekcji × 3 = {total} zadań. Rozkład: {stats}")


if __name__ == "__main__":
    main()
