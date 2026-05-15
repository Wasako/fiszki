/**
 * Legenda symboli pod fiszkami (wzory z data/fiszki-wzory.json — pole `name` = `front` w `js/app.js`).
 * Klucz mapy: trim(topic) + '\x1e' + trim(name) — ten sam łańcuch co `sheetSymbolLegendKey(topic, front)` w `js/app.js`.
 * Generowanie: python tools/gen_wzory_symbol_legends.py
 */
(function () {
  "use strict";
  window.__WZORY_SYMBOL_LEGEND__ = {
  "Kinematyka\u001ePrędkość": [
    [
      "\\Delta \\vec{r}",
      "przyrost wektora położenia (przemieszczenie)"
    ],
    [
      "\\vec{v}",
      "wektor prędkości"
    ],
    [
      "\\vec{r}",
      "wektor położenia"
    ],
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Kinematyka\u001ePrzyspieszenie": [
    [
      "\\Delta \\vec{v}",
      "przyrost wektora prędkości"
    ],
    [
      "\\vec{v}",
      "wektor prędkości"
    ],
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Kinematyka\u001ePrędkość kątowa": [
    [
      "\\Delta t",
      "przyrost czasu"
    ],
    [
      "\\Delta \\alpha",
      "przyrost kąta obrotu"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ]
  ],
  "Kinematyka\u001eZwiązek prędkości kątowej i liniowej": [
    [
      "v",
      "prędkość liniowa"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "r",
      "promień okręgu"
    ]
  ],
  "Kinematyka\u001eRuch jednostajny po okręgu (okres, częstotliwość)": [
    [
      "T",
      "okres"
    ],
    [
      "f",
      "częstotliwość"
    ],
    [
      "\\pi",
      "liczba pi"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ]
  ],
  "Kinematyka\u001ePrzyspieszenie dośrodkowe": [
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "a_{\\mathrm{do}}",
      "przyspieszenie dośrodkowe"
    ]
  ],
  "Kinematyka\u001ePrzyspieszenie kątowe": [
    [
      "\\Delta t",
      "przyrost czasu"
    ],
    [
      "\\Delta \\omega",
      "przyrost prędkości kątowej"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ]
  ],
  "Kinematyka\u001ePrzyspieszenie styczne": [
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ],
    [
      "a_{\\mathrm{st}}",
      "przyspieszenie styczne"
    ]
  ],
  "Kinematyka\u001ePrędkość w ruchu jednostajnie zmiennym prostoliniowym": [
    [
      "\\vec{v}_0",
      "prędkość początkowa (wektor)"
    ],
    [
      "\\vec{v}",
      "wektor prędkości"
    ],
    [
      "\\vec{a}",
      "wektor przyspieszenia"
    ]
  ],
  "Kinematyka\u001eDroga w ruchu jednostajnie zmiennym prostoliniowym": [
    [
      "s",
      "droga"
    ],
    [
      "v_0",
      "prędkość początkowa"
    ],
    [
      "a",
      "przyspieszenie"
    ],
    [
      "t",
      "czas"
    ]
  ],
  "Kinematyka\u001eŚrednia prędkość na prostej (droga i czas)": [
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Kinematyka\u001eDroga w ruchu jednostajnym prostoliniowym (skalar)": [
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Kinematyka\u001eSkładowe prędkości na płaszczyźnie (wzór trygonometryczny)": [],
  "Kinematyka\u001eRuch pionowy przy stałym g — wiązanie prędkości z wysokością": [],
  "Siły tarcia i siła sprężystości\u001eSiła tarcia kinetycznego": [
    [
      "T_k",
      "siła tarcia kinetycznego"
    ],
    [
      "F_N",
      "siła nacisku prostopadła do powierzchni"
    ],
    [
      "\\mu_k",
      "współczynnik tarcia kinetycznego"
    ]
  ],
  "Siły tarcia i siła sprężystości\u001eSiła tarcia statycznego": [
    [
      "T_s",
      "siła tarcia statycznego"
    ],
    [
      "F_N",
      "siła nacisku prostopadła do powierzchni"
    ],
    [
      "\\mu_s",
      "współczynnik tarcia statycznego"
    ]
  ],
  "Siły tarcia i siła sprężystości\u001eSiła sprężystości": [
    [
      "F_s",
      "siła sprężystości"
    ],
    [
      "k",
      "stała sprężyny"
    ],
    [
      "x",
      "odkształcenie"
    ]
  ],
  "Siły tarcia i siła sprężystości\u001eEnergia potencjalna sprężystości": [
    [
      "k",
      "stała sprężystości"
    ],
    [
      "x",
      "odkształcenie"
    ],
    [
      "E_{\\mathrm{pot}}",
      "energia potencjalna"
    ]
  ],
  "Dynamika\u001ePęd": [
    [
      "m",
      "masa punktu materialnego"
    ],
    [
      "\\vec{v}",
      "wektor prędkości"
    ],
    [
      "\\vec{p}",
      "wektor pędu"
    ]
  ],
  "Dynamika\u001eII zasada dynamiki (układ inercjalny)": [
    [
      "m",
      "masa"
    ],
    [
      "\\vec{p}",
      "wektor pędu"
    ],
    [
      "\\vec{a}",
      "wektor przyspieszenia"
    ],
    [
      "\\vec{F}",
      "wektor siły"
    ],
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Dynamika\u001eWartość momentu pędu punktu materialnego": [
    [
      "\\vec{r}",
      "wektor położenia"
    ],
    [
      "\\vec{p}",
      "wektor pędu"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Dynamika\u001eWartość momentu siły": [
    [
      "\\vec{r}",
      "wektor położenia"
    ],
    [
      "\\vec{F}",
      "wektor siły"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Dynamika\u001eMoment bezwładności": [
    [
      "m_i",
      "masa i-tego punktu"
    ],
    [
      "r_i",
      "odległość i-tej cząstki od osi obrotu"
    ]
  ],
  "Dynamika\u001eMoment pędu bryły sztywnej": [
    [
      "L",
      "moment pędu"
    ],
    [
      "I",
      "moment bezwładności"
    ],
    [
      "\\omega",
      "prędkość kątowa"
    ]
  ],
  "Dynamika\u001eII zasada dynamiki ruchu obrotowego (zapis skalarny)": [
    [
      "I",
      "moment bezwładności"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe"
    ],
    [
      "M",
      "moment siły"
    ]
  ],
  "Dynamika\u001ePraca siły": [
    [
      "\\Delta \\vec{r}",
      "przyrost wektora położenia (przemieszczenie)"
    ],
    [
      "\\vec{r}",
      "wektor położenia"
    ],
    [
      "\\vec{F}",
      "wektor siły"
    ],
    [
      "W_F",
      "praca siły"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Dynamika\u001ePraca momentu siły": [
    [
      "\\Delta \\alpha",
      "przyrost kąta obrotu"
    ],
    [
      "W_M",
      "praca momentu siły"
    ]
  ],
  "Dynamika\u001eMoc": [
    [
      "P",
      "moc średnia"
    ],
    [
      "W",
      "praca"
    ],
    [
      "\\Delta t",
      "przedział czasu"
    ]
  ],
  "Dynamika\u001eSiła nacisku przy przyspieszeniu układu w kierunku pionowym": [
    [
      "F_N",
      "siła nacisku prostopadła do powierzchni"
    ]
  ],
  "Dynamika\u001eEnergia kinetyczna ruchu postępowego": [
    [
      "m",
      "masa"
    ],
    [
      "v",
      "prędkość (moduł)"
    ],
    [
      "E_{\\mathrm{kin}}",
      "energia kinetyczna"
    ]
  ],
  "Dynamika\u001eEnergia kinetyczna ruchu obrotowego": [
    [
      "I",
      "moment bezwładności"
    ],
    [
      "\\omega",
      "prędkość kątowa"
    ],
    [
      "E_{\\mathrm{kin}}",
      "energia kinetyczna"
    ]
  ],
  "Grawitacja i elementy astronomii\u001ePrawo powszechnego ciążenia": [
    [
      "F_g",
      "siła grawitacji"
    ],
    [
      "m_1",
      "masa pierwszego ciała"
    ],
    [
      "m_2",
      "masa drugiego ciała"
    ],
    [
      "G",
      "stała grawitacji"
    ]
  ],
  "Grawitacja i elementy astronomii\u001eNatężenie pola grawitacyjnego i przyspieszenie grawitacyjne": [
    [
      "\\gamma",
      "natężenie pola grawitacyjnego"
    ],
    [
      "F_g",
      "siła grawitacji"
    ],
    [
      "m",
      "masa próbna"
    ],
    [
      "a_g",
      "przyspieszenie grawitacyjne (wartość pola)"
    ]
  ],
  "Grawitacja i elementy astronomii\u001eEnergia potencjalna grawitacji": [
    [
      "E_{\\mathrm{pot}}",
      "energia potencjalna"
    ],
    [
      "m_1",
      "masa pierwszego ciała"
    ],
    [
      "m_2",
      "masa drugiego ciała"
    ],
    [
      "G",
      "stała grawitacji"
    ]
  ],
  "Grawitacja i elementy astronomii\u001eZmiana energii potencjalnej przy powierzchni Ziemi": [
    [
      "m",
      "masa"
    ],
    [
      "g",
      "przyspieszenie ziemskie"
    ],
    [
      "\\Delta h",
      "różnica wysokości"
    ],
    [
      "\\Delta E_p",
      "zmiana energii potencjalnej"
    ],
    [
      "E_p",
      "energia potencjalna (składowa oscylatora)"
    ]
  ],
  "Grawitacja i elementy astronomii\u001ePrędkość na orbicie kołowej": [
    [
      "v_{\\mathrm{or}}",
      "prędkość na orbicie kołowej"
    ],
    [
      "M",
      "masa centralnego ciała (np. gwiazdy, planety)"
    ]
  ],
  "Grawitacja i elementy astronomii\u001ePrędkość ucieczki": [
    [
      "v_u",
      "prędkość ucieczki"
    ],
    [
      "G",
      "stała grawitacji"
    ],
    [
      "M",
      "masa centralna"
    ],
    [
      "r",
      "odległość"
    ]
  ],
  "Grawitacja i elementy astronomii\u001eII prawo Keplera i zachowanie momentu pędu na orbicie": [
    [
      "\\vec{L}",
      "wektor momentu pędu"
    ],
    [
      "\\Delta t",
      "przyrost czasu"
    ],
    [
      "\\Delta S",
      "pole zakreślone przez promień wodzący"
    ],
    [
      "\\mathrm{const}",
      "wielkość stała w danym zjawisku"
    ]
  ],
  "Grawitacja i elementy astronomii\u001eIII prawo Keplera": [
    [
      "T_1",
      "okres obiegu ciała 1"
    ],
    [
      "T_2",
      "okres obiegu ciała 2"
    ],
    [
      "a_1",
      "półoś wielka / promień orbity — ciało 1"
    ],
    [
      "a_2",
      "półoś wielka / promień orbity — ciało 2"
    ],
    [
      "\\mathrm{const}",
      "wielkość stała w danym zjawisku"
    ]
  ],
  "Grawitacja i elementy astronomii\u001ePrawo Hubble'a": [
    [
      "v",
      "prędkość oddalania"
    ],
    [
      "H",
      "stała Hubble'a"
    ],
    [
      "d",
      "odległość"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eMaksymalne wychylenie (amplituda)": [
    [
      "x_{\\max}",
      "maksymalne wychylenie"
    ],
    [
      "A",
      "amplituda drgań"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001ePołożenie w ruchu harmonicznym": [
    [
      "\\varphi_0",
      "faza początkowa"
    ],
    [
      "\\omega t",
      "kąt fazowy (argument sin/cos)"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "x(t)",
      "położenie od równowagi w czasie"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001ePrędkość w ruchu harmonicznym": [
    [
      "\\varphi_0",
      "faza początkowa"
    ],
    [
      "\\omega t",
      "kąt fazowy (argument sin/cos)"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001ePrzyspieszenie w ruchu harmonicznym": [
    [
      "\\varphi_0",
      "faza początkowa"
    ],
    [
      "\\omega t",
      "kąt fazowy (argument sin/cos)"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "a(t)",
      "przyspieszenie w funkcji czasu"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eMaksima prędkości i przyspieszenia (drgania)": [
    [
      "v_{\\max}",
      "maks. prędkość drgań"
    ],
    [
      "A",
      "amplituda"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "a_{\\max}",
      "maks. przyspieszenie drgań"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eSiła harmoniczna": [
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "F_h",
      "siła harmoniczna"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eCzęstość kołowa małych drgań (sprężyna, wahadło matematyczne)": [
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "\\ell",
      "długość wahadła matematycznego"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eEnergia mechaniczna oscylatora": [
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "E_k",
      "energia kinetyczna (składowa oscylatora)"
    ],
    [
      "E_p",
      "energia potencjalna (składowa oscylatora)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001ePrędkość fali (długość, okres, częstotliwość)": [
    [
      "T",
      "okres"
    ],
    [
      "f",
      "częstotliwość"
    ],
    [
      "v",
      "prędkość fali"
    ],
    [
      "\\lambda",
      "długość fali"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eFaza fali w punkcie i chwili": [
    [
      "\\varphi_0",
      "faza początkowa"
    ],
    [
      "\\varphi(t)",
      "faza w funkcji czasu"
    ],
    [
      "\\lambda",
      "długość fali"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eWarunek wzmocnienia interferencyjnego": [
    [
      "\\varphi_2",
      "faza drugiej fali"
    ],
    [
      "\\varphi_1",
      "faza pierwszej fali"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eWarunek osłabienia interferencyjnego": [
    [
      "\\varphi_2",
      "faza drugiej fali"
    ],
    [
      "\\varphi_1",
      "faza pierwszej fali"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eNatężenie fali (średnie) i zależność od amplitudy": [
    [
      "\\Delta t",
      "przyrost czasu"
    ],
    [
      "\\propto",
      "proporcjonalność (współczynnik pominięty)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eNatężenie fali kulistej a odległość": [
    [
      "I",
      "natężenie fali"
    ],
    [
      "r",
      "odległość od źródła"
    ],
    [
      "\\propto",
      "proporcjonalność (współczynnik pominięty)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001ePrawo Snelliusa (załamanie na granicy ośrodków)": [
    [
      "\\alpha_1",
      "kąt w ośrodku 1"
    ],
    [
      "\\alpha_2",
      "kąt w ośrodku 2"
    ],
    [
      "v_1",
      "prędkość fali w ośrodku 1"
    ],
    [
      "v_2",
      "prędkość fali w ośrodku 2"
    ],
    [
      "n_1",
      "współczynnik załamania ośrodka 1"
    ],
    [
      "n_2",
      "współczynnik załamania ośrodka 2"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eDoppler (dźwięk) — przybliżenie, źródło oddala się": [
    [
      "f_{\\mathrm{ob}}",
      "częstotliwość obserwowana"
    ],
    [
      "f_{\\mathrm{źr}}",
      "częstotliwość źródła"
    ],
    [
      "v_{\\mathrm{ob}}",
      "prędkość obserwatora względem ośrodka"
    ],
    [
      "v_{\\mathrm{źr}}",
      "prędkość źródła względem ośrodka"
    ],
    [
      "v_d",
      "prędkość fali w ośrodku (np. dźwięku)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eDoppler (dźwięk) — przybliżenie, źródło zbliża się": [
    [
      "f_{\\mathrm{ob}}",
      "częstotliwość obserwowana"
    ],
    [
      "f_{\\mathrm{źr}}",
      "częstotliwość źródła"
    ],
    [
      "v_{\\mathrm{ob}}",
      "prędkość obserwatora względem ośrodka"
    ],
    [
      "v_{\\mathrm{źr}}",
      "prędkość źródła względem ośrodka"
    ],
    [
      "v_d",
      "prędkość fali w ośrodku (np. dźwięku)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eDoppler (światło) — przybliżenie, źródło oddala się": [
    [
      "f_{\\mathrm{ob}}",
      "częstotliwość obserwowana"
    ],
    [
      "f_{\\mathrm{źr}}",
      "częstotliwość źródła"
    ],
    [
      "v_{\\mathrm{źr}}",
      "prędkość źródła względem ośrodka"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eDoppler (światło) — przybliżenie, źródło zbliża się": [
    [
      "f_{\\mathrm{ob}}",
      "częstotliwość obserwowana"
    ],
    [
      "f_{\\mathrm{źr}}",
      "częstotliwość źródła"
    ],
    [
      "v_{\\mathrm{źr}}",
      "prędkość źródła względem ośrodka"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eDoppler — wzory ścisłe (dźwięk i światło, kierunek prędkości źródła)": [
    [
      "f_{\\mathrm{ob}}",
      "częstotliwość obserwowana"
    ],
    [
      "f_{\\mathrm{źr}}",
      "częstotliwość źródła"
    ],
    [
      "v_{\\mathrm{ob}}",
      "prędkość obserwatora względem ośrodka"
    ],
    [
      "v_{\\mathrm{źr}}",
      "prędkość źródła względem ośrodka"
    ],
    [
      "v_d",
      "prędkość fali w ośrodku (np. dźwięku)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eSiatka dyfrakcyjna": [
    [
      "\\lambda",
      "długość fali"
    ],
    [
      "\\alpha_n",
      "kąt dla rzędu dyfrakcji n"
    ],
    [
      "d",
      "stała siatki dyfrakcyjnej"
    ],
    [
      "n",
      "rząd dyfrakcji (liczba całkowita)"
    ]
  ],
  "Drgania, fale mechaniczne i świetlne\u001eŚwiatło po przejściu przez polaryzator (oznaczenia amplitud)": [
    [
      "\\vec{E}_0",
      "pole padające na polaryzator (wektor)"
    ],
    [
      "\\vec{E}_P",
      "pole po przejściu przez polaryzator"
    ],
    [
      "\\vec{E}",
      "wektor natężenia pola elektrycznego"
    ]
  ],
  "Optyka geometryczna\u001eKąt graniczny (przejście z ośrodka 2 do 1)": [
    [
      "\\alpha_{2\\,\\mathrm{gr}}",
      "kąt graniczny w ośrodku 2"
    ],
    [
      "n_1",
      "współczynnik załamania ośrodka 1"
    ],
    [
      "n_2",
      "współczynnik załamania ośrodka 2"
    ]
  ],
  "Optyka geometryczna\u001eWarunek polaryzacji światła przy odbiciu (kąt Brewstera)": [
    [
      "\\alpha_{\\mathrm{pad}\\,1}",
      "kąt padania w ośrodku 1"
    ],
    [
      "\\alpha_{\\mathrm{zał}\\,2}",
      "kąt załamania w ośrodku 2"
    ]
  ],
  "Optyka geometryczna\u001eRównanie soczewki i zwierciadła": [
    [
      "x",
      "odległość przedmiotu"
    ],
    [
      "y",
      "obrazu"
    ],
    [
      "f",
      "ogniskowa"
    ]
  ],
  "Optyka geometryczna\u001eWzór na ogniskową soczewki (promienie krzywizny, środowiska)": [
    [
      "R_1",
      "promień krzywizny pierwszej powierzchni soczewki"
    ],
    [
      "R_2",
      "promień krzywizny drugiej powierzchni"
    ],
    [
      "n_{\\mathrm{socz}}",
      "współczynnik załamania soczewki"
    ],
    [
      "n_{\\mathrm{otocz}}",
      "współczynnik załamania ośrodka zewnętrznego"
    ]
  ],
  "Hydrostatyka, aerostatyka\u001eSiła parcia i ciśnienie": [
    [
      "\\Delta \\vec{S}",
      "wektor powierzchni"
    ],
    [
      "\\vec{F}",
      "wektor siły"
    ],
    [
      "\\vec{S}",
      "wektor powierzchni pętli"
    ],
    [
      "\\Delta S",
      "pole zakreślone przez promień wodzący"
    ]
  ],
  "Hydrostatyka, aerostatyka\u001eZmiana ciśnienia hydro- i aerostatycznego": [
    [
      "\\Delta h",
      "różnica wysokości"
    ],
    [
      "\\Delta p",
      "różnica ciśnień"
    ],
    [
      "\\rho",
      "gęstość cieczy lub gazu"
    ]
  ],
  "Hydrostatyka, aerostatyka\u001eSiła wyporu (Archimedes)": [
    [
      "F_{\\mathrm{wyp}}",
      "siła wyporu"
    ],
    [
      "V_{\\mathrm{zan}}",
      "objętość zanurzonej części ciała"
    ],
    [
      "\\rho",
      "gęstość ośrodka płynnego"
    ]
  ],
  "Hydrostatyka, aerostatyka\u001eGęstość substancji": [],
  "Hydrostatyka, aerostatyka\u001eCiśnienie (definicja mechaniczna)": [
    [
      "\\Delta S",
      "pole zakreślone przez promień wodzący"
    ]
  ],
  "Termodynamika\u001eI zasada termodynamiki": [
    [
      "\\Delta U",
      "zmiana energii wewnętrnej"
    ],
    [
      "Q",
      "ciepło"
    ],
    [
      "W",
      "praca"
    ]
  ],
  "Termodynamika\u001ePraca siły parcia przy stałym ciśnieniu": [
    [
      "p",
      "ciśnienie"
    ],
    [
      "\\Delta V",
      "zmiana objętości"
    ]
  ],
  "Termodynamika\u001ePraca siły parcia a wykres p(V)": [
    [
      "W_{AB}",
      "praca od A do B"
    ]
  ],
  "Termodynamika\u001eCiepło właściwe": [
    [
      "\\Delta T",
      "zmiana temperatury"
    ],
    [
      "c_w",
      "ciepło właściwe"
    ]
  ],
  "Termodynamika\u001eCiepło molowe": [
    [
      "C",
      "ciepło molowe"
    ],
    [
      "Q",
      "ciepło"
    ],
    [
      "n",
      "liczba moli"
    ],
    [
      "\\Delta T",
      "zmiana temperatury"
    ]
  ],
  "Termodynamika\u001eCiepło przemiany fazowej": [
    [
      "L",
      "ciepło przemiany fazowej (właściwe)"
    ],
    [
      "Q",
      "ciepło"
    ],
    [
      "m",
      "masa"
    ]
  ],
  "Termodynamika\u001eŚrednia energia ruchu cząsteczki gazu doskonałego": [
    [
      "E_{\\mathrm{śr}}",
      "średnia energia kinetyczna cząsteczki"
    ],
    [
      "k_B",
      "stała Boltzmanna"
    ],
    [
      "s",
      "liczba współrzędnych położenia cząsteczki"
    ]
  ],
  "Termodynamika\u001eRównanie stanu gazu doskonałego (Clapeyrona)": [
    [
      "n",
      "liczba moli gazu"
    ],
    [
      "R",
      "uniwersalna stała gazowa"
    ]
  ],
  "Termodynamika\u001eZwiązek ciepeł molowych gazu doskonałego": [
    [
      "C_V",
      "ciepło molowe przy V=const"
    ],
    [
      "C_p",
      "ciepło molowe przy p=const"
    ],
    [
      "R",
      "uniwersalna stała gazowa"
    ]
  ],
  "Termodynamika\u001ePraca i ciepło w cyklu (silnik / pompa cieplna)": [
    [
      "W_{\\mathrm{calk}}",
      "suma prac w cyklu"
    ],
    [
      "Q_{\\mathrm{calk}}",
      "suma ciepła w cyklu"
    ]
  ],
  "Termodynamika\u001eSprawność silnika cieplnego": [
    [
      "W_{\\mathrm{calk}}",
      "suma prac w cyklu"
    ],
    [
      "Q_{\\mathrm{pob}}",
      "ciepło pobrane z gorącego źródła"
    ],
    [
      "Q_{\\mathrm{odd}}",
      "ciepło oddane do zimnego źródła"
    ],
    [
      "\\eta",
      "sprawność silnika cieplnego"
    ]
  ],
  "Elektrostatyka\u001ePrawo Coulomba i stała elektrostatyczna": [
    [
      "\\varepsilon_0",
      "przenikalność elektryczna próżni"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ],
    [
      "F_e",
      "wartość siły elektrycznej (Coulomb)"
    ],
    [
      "q_1",
      "ładunek pierwszy"
    ],
    [
      "q_2",
      "ładunek drugi"
    ],
    [
      "k",
      "stała elektrostatyczna Coulomba"
    ]
  ],
  "Elektrostatyka\u001eNatężenie pola elektrycznego": [
    [
      "\\vec{F}",
      "wektor siły"
    ],
    [
      "\\vec{E}",
      "wektor natężenia pola elektrycznego"
    ],
    [
      "\\vec{F}_e",
      "siła elektryczna na ładunek"
    ]
  ],
  "Elektrostatyka\u001eNatężenie pola na zewnątrz sferycznego rozkładu ładunku": [
    [
      "E",
      "natężenie pola"
    ],
    [
      "k",
      "stała"
    ],
    [
      "Q",
      "ładunek sfery"
    ],
    [
      "r",
      "odległość od środka"
    ]
  ],
  "Elektrostatyka\u001eNapięcie między punktami A i B (praca na ładunek)": [
    [
      "W_{AB}",
      "praca od A do B"
    ],
    [
      "U_{AB}",
      "napięcie między A i B"
    ]
  ],
  "Elektrostatyka\u001eNapięcie a potencjały elektryczne": [
    [
      "U_{AB}",
      "napięcie między A i B"
    ],
    [
      "V_B",
      "potencjał elektryczny w punkcie B"
    ],
    [
      "V_A",
      "potencjał elektryczny w punkcie A"
    ]
  ],
  "Elektrostatyka\u001eEnergia potencjalna elektryczna układu ładunków": [
    [
      "E_{\\mathrm{pot}}",
      "energia potencjalna"
    ],
    [
      "q_1",
      "ładunek pierwszy"
    ],
    [
      "q_2",
      "ładunek drugi"
    ],
    [
      "k",
      "stała elektrostatyczna"
    ]
  ],
  "Elektrostatyka\u001eNapięcie w polu jednorodnym": [
    [
      "U",
      "napięcie"
    ],
    [
      "E",
      "natężenie pola jednorodnego"
    ],
    [
      "d",
      "odległość"
    ]
  ],
  "Elektrostatyka\u001eNatężenie pola między płytami naładowanymi różnoimiennie": [
    [
      "\\sigma",
      "gęstość ładunku powierzchniowego na okładce"
    ],
    [
      "\\Delta S",
      "pole zakreślone przez promień wodzący"
    ],
    [
      "\\varepsilon_0",
      "przenikalność elektryczna próżni"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ],
    [
      "\\mathrm{const}",
      "wielkość stała w danym zjawisku"
    ]
  ],
  "Elektrostatyka\u001eNatężenie pola wewnątrz dielektryka": [
    [
      "\\vec{E}_0",
      "pole padające na polaryzator (wektor)"
    ],
    [
      "\\vec{E}",
      "wektor natężenia pola elektrycznego"
    ],
    [
      "\\varepsilon_r",
      "względna przenikalność dielektryka"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ]
  ],
  "Elektrostatyka\u001ePojemność kondensatora": [],
  "Elektrostatyka\u001ePojemność kondensatora płaskiego z dielektrykiem": [
    [
      "\\varepsilon_0",
      "przenikalność elektryczna próżni"
    ],
    [
      "\\varepsilon_r",
      "względna przenikalność dielektryka"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ]
  ],
  "Elektrostatyka\u001eEnergia elektryczna kondensatora": [
    [
      "W",
      "energia w kondensatorze"
    ],
    [
      "Q",
      "ładunek"
    ],
    [
      "C",
      "pojemność"
    ],
    [
      "U",
      "napięcie (równoważne postacie)"
    ]
  ],
  "Elektrostatyka\u001ePole wewnątrz i na powierzchni przewodnika (równowaga)": [
    [
      "\\vec{E}_{\\mathrm{wew}}",
      "natężenie wewnątrz przewodnika w równowadze"
    ],
    [
      "\\vec{E}_{\\mathrm{pow}}",
      "natężenie na powierzchni przewodnika"
    ],
    [
      "\\Delta \\vec{S}",
      "wektor powierzchni"
    ],
    [
      "\\vec{E}",
      "wektor natężenia pola elektrycznego"
    ],
    [
      "\\vec{S}",
      "wektor powierzchni pętli"
    ]
  ],
  "Prąd elektryczny\u001eNatężenie prądu": [
    [
      "\\Delta t",
      "przyrost czasu"
    ],
    [
      "\\Delta Q",
      "przyrost ładunku"
    ]
  ],
  "Prąd elektryczny\u001eDefinicja oporu przewodnika": [],
  "Prąd elektryczny\u001ePrawo Ohma (dla stałej temperatury przewodnika)": [
    [
      "\\mathrm{const}",
      "wielkość stała w danym zjawisku"
    ]
  ],
  "Prąd elektryczny\u001eOpór przewodnika z drutu": [
    [
      "\\rho",
      "opór właściwy materiału"
    ],
    [
      "\\ell",
      "długość wahadła matematycznego"
    ]
  ],
  "Prąd elektryczny\u001eMoc prądu stałego na oporniku": [],
  "Prąd elektryczny\u001eOpór metali a temperatura (liniowy przybliżony model)": [
    [
      "\\Delta T",
      "zmiana temperatury"
    ]
  ],
  "Prąd elektryczny\u001eDodawanie napięć między punktami przewodnika": [
    [
      "U_{AB}",
      "napięcie między A i B"
    ]
  ],
  "Prąd elektryczny\u001eII prawo Kirchhoffa dla obwodu (oczka)": [
    [
      "\\mathcal{E}",
      "siła elektromotoryczna (SEM)"
    ]
  ],
  "Prąd elektryczny\u001eSEM a napięcie na zaciskach baterii": [
    [
      "R_w",
      "opór wewnętrzny źródła"
    ],
    [
      "\\mathcal{E}",
      "siła elektromotoryczna (SEM)"
    ]
  ],
  "Prąd elektryczny\u001eOpór zastępczy połączenia szeregowego": [
    [
      "R_z",
      "opór zastępczy"
    ],
    [
      "R_i",
      "opór i-tego opornika"
    ]
  ],
  "Prąd elektryczny\u001eOpór zastępczy połączenia równoległego": [
    [
      "R_z",
      "opór zastępczy"
    ],
    [
      "R_i",
      "opór i-tego opornika"
    ]
  ],
  "Magnetyzm\u001eSiła Lorentza (wartość; kąt między v i B)": [
    [
      "\\vec{v}",
      "wektor prędkości"
    ],
    [
      "\\vec{F}",
      "wektor siły"
    ],
    [
      "\\vec{B}",
      "wektor indukcji magnetycznej"
    ]
  ],
  "Magnetyzm\u001eSiła elektrodynamiczna na odcinku przewodnika": [
    [
      "\\Delta \\vec{\\ell}",
      "wektor odcinka przewodnika"
    ],
    [
      "\\vec{B}",
      "wektor indukcji magnetycznej"
    ],
    [
      "\\ell",
      "długość wahadła matematycznego"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Magnetyzm\u001ePole magnetyczne długiego prostoliniowego przewodnika": [
    [
      "\\mu_0",
      "przenikalność magnetyczna próżni"
    ]
  ],
  "Magnetyzm\u001ePole wewnątrz długiej ciasnej zwojnicy": [
    [
      "\\mu_0",
      "przenikalność magnetyczna próżni"
    ],
    [
      "L",
      "długość zwojnicy"
    ]
  ],
  "Magnetyzm\u001eMoment siły na pętlę z prądem w polu B": [
    [
      "\\vec{B}",
      "wektor indukcji magnetycznej"
    ],
    [
      "\\vec{S}",
      "wektor powierzchni pętli"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Magnetyzm\u001eStrumień magnetyczny przez powierzchnię": [
    [
      "\\vec{B}",
      "wektor indukcji magnetycznej"
    ],
    [
      "\\vec{S}",
      "wektor powierzchni pętli"
    ],
    [
      "\\Phi_B",
      "strumień magnetyczny"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Magnetyzm\u001eSEM indukcji (Faraday–Lenz)": [
    [
      "\\Delta t",
      "przyrost czasu"
    ],
    [
      "\\Delta \\Phi_B",
      "przyrost strumienia magnetycznego"
    ],
    [
      "\\mathcal{E}",
      "siła elektromotoryczna (SEM)"
    ],
    [
      "\\Phi_B",
      "strumień magnetyczny"
    ]
  ],
  "Magnetyzm\u001eSEM prądnicy (obrót w polu magnetycznym)": [
    [
      "\\vec{B}",
      "wektor indukcji magnetycznej"
    ],
    [
      "\\vec{S}",
      "wektor powierzchni pętli"
    ],
    [
      "\\varphi_0",
      "faza początkowa"
    ],
    [
      "\\omega t",
      "kąt fazowy (argument sin/cos)"
    ],
    [
      "\\omega",
      "częstość kątowa"
    ],
    [
      "\\mathcal{E}",
      "siła elektromotoryczna (SEM)"
    ],
    [
      "N",
      "liczba zwojów cewki w prądnicy"
    ],
    [
      "\\angle",
      "kąt między wektorami zapisanymi w nawiasie"
    ]
  ],
  "Magnetyzm\u001ePraca prądu sinusoidalnego w czasie jednego okresu": [
    [
      "I_0",
      "amplituda prądu sinusoidalnego"
    ],
    [
      "U_0",
      "amplituda napięcia sinusoidalnego"
    ]
  ],
  "Magnetyzm\u001eWartości skuteczne prądu i napięcia (sinus)": [
    [
      "I_0",
      "amplituda prądu sinusoidalnego"
    ],
    [
      "U_0",
      "amplituda napięcia sinusoidalnego"
    ],
    [
      "I_{\\mathrm{sk}}",
      "natężenie skuteczne"
    ],
    [
      "U_{\\mathrm{sk}}",
      "napięcie skuteczne"
    ]
  ],
  "Magnetyzm\u001eUproszczony model transformatora": [
    [
      "N_1",
      "liczba zwojów uzwojenia pierwszego"
    ],
    [
      "N_2",
      "liczba zwojów uzwojenia drugiego"
    ],
    [
      "I_1",
      "prąd strony pierwszej transformatora"
    ],
    [
      "I_2",
      "prąd strony drugiej transformatora"
    ],
    [
      "U_1",
      "napięcie strony pierwszej transformatora"
    ],
    [
      "U_2",
      "napięcie strony drugiej transformatora"
    ]
  ],
  "Elementy mechaniki relatywistycznej\u001eEnergia całkowita ciała (relatywistyczna)": [
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Elementy mechaniki relatywistycznej\u001eEnergia spoczynkowa": [
    [
      "E_0",
      "energia spoczynkowa lub amplituda (z kontekstu wzoru)"
    ]
  ],
  "Elementy mechaniki relatywistycznej\u001eRównoważność zmiany masy i energii": [],
  "Elementy mechaniki relatywistycznej\u001ePęd relatywistyczny": [
    [
      "\\Delta t",
      "przyrost czasu"
    ]
  ],
  "Elementy mechaniki relatywistycznej\u001eNiezmiennik relatywistyczny (dynamiczny)": [
    [
      "E_0",
      "energia spoczynkowa lub amplituda (z kontekstu wzoru)"
    ]
  ],
  "Elementy mechaniki relatywistycznej\u001eEnergia kinetyczna": [
    [
      "E_{\\mathrm{kin}}",
      "energia kinetyczna"
    ],
    [
      "E_0",
      "energia spoczynkowa lub amplituda (z kontekstu wzoru)"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001ePrawo Wiena": [
    [
      "\\lambda_{\\max}",
      "długość fali maksymalnej emisji (Wien)"
    ],
    [
      "\\lambda",
      "długość fali"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001ePrawo Stefana–Boltzmanna (moc z jednostki powierzchni)": [
    [
      "\\sigma",
      "stała Stefana–Boltzmanna (promieniowanie ciała doskonale czarnego)"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001eEnergia i pęd fotonu": [
    [
      "\\lambda",
      "długość fali"
    ],
    [
      "E_f",
      "energia fotonu"
    ],
    [
      "h",
      "stała Plancka"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001eZjawisko fotoelektryczne": [
    [
      "E_{\\mathrm{kin\\,el\\,max}}",
      "maks. energia kinetyczna elektronu"
    ],
    [
      "W_{\\mathrm{el}}",
      "praca wyjścia elektronu z metalu"
    ],
    [
      "E_f",
      "energia fotonu"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001eEmisja lub absorpcja fotonu przez atom": [
    [
      "E_{\\mathrm{odrzutu}}",
      "energia odrzutu / rekoiłu"
    ],
    [
      "E_n",
      "energia poziomu n w wodorze"
    ],
    [
      "E_m",
      "energia poziomu m w atomie"
    ],
    [
      "h",
      "stała Plancka"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001ePoziomy energetyczne atomu wodoru": [
    [
      "E_n",
      "energia poziomu n w wodorze"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001eDługość fali de Broglie'a": [
    [
      "\\lambda",
      "długość fali"
    ],
    [
      "h",
      "stała Plancka"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001eZasady zachowania (wybrane, poziom fundamentalny)": [
    [
      "\\text{zasady}",
      "zachowanie ładunku, energii, pędu i liczby nukleonów w układzie izolowanym"
    ]
  ],
  "Elementy fizyki atomowej i jądrowej\u001eStatystyczne prawo rozpadu promieniotwórczego": [
    [
      "N_0",
      "liczba jąder w chwili początkowej"
    ],
    [
      "N(t)",
      "liczba nierozpadłych jąder w czasie t"
    ]
  ],
  "Wybrane zależności\u001eŚrodek masy układu punktów materialnych": [
    [
      "\\vec{r}",
      "wektor położenia"
    ],
    [
      "\\vec{r}_i",
      "położenie i-tego punktu"
    ],
    [
      "\\vec{r}_{\\mathrm{SM}}",
      "położenie środka masy"
    ],
    [
      "m_i",
      "masa i-tego punktu"
    ]
  ],
  "Wybrane zależności\u001eDroga a pole pod wykresem v(t)": [],
  "Wybrane zależności\u001ePraca a pole pod wykresem F(s)": [
    [
      "W_{AB}",
      "praca od A do B"
    ]
  ],
  "Wybrane zależności\u001ePraca a pole pod wykresem P(t)": [
    [
      "W_{AB}",
      "praca od A do B"
    ]
  ],
  "Wybrane zależności\u001eDodawanie i odejmowanie wektorów (konstrukcje)": [
    [
      "\\vec{V}_1,\\,\\vec{V}_2",
      "wektory składane — równoległobok, trójkąt, składowe w układzie"
    ]
  ],
  "Podstawowe jednostki SI\u001eSiedem jednostek podstawowych": [
    [
      "\\text{SI}",
      "m, kg, s, A, K, mol, cd — jednostki podstawowe układu SI (jak w informatorze)"
    ]
  ],
  "Przedrostki jednostek miar\u001eNazwy i oznaczenia (wybrane)": [
    [
      "\\text{SI}",
      "przedrostki dziesiętne od jotta (Y) do jokta (y)"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001ePrędkość światła w próżni": [],
  "Wartości wybranych stałych fizycznych\u001eStała Plancka": [],
  "Wartości wybranych stałych fizycznych\u001eŁadunek elementarny": [],
  "Wartości wybranych stałych fizycznych\u001eStała Boltzmanna": [
    [
      "k_B",
      "stała Boltzmanna"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001eStała Avogadra": [],
  "Wartości wybranych stałych fizycznych\u001eUniwersalna stała gazowa": [],
  "Wartości wybranych stałych fizycznych\u001eStała grawitacji": [],
  "Wartości wybranych stałych fizycznych\u001ePrzenikalność magnetyczna próżni": [
    [
      "\\mu_0",
      "przenikalność magnetyczna próżni"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001ePrzenikalność elektryczna próżni i stała k": [
    [
      "\\varepsilon_0",
      "przenikalność elektryczna próżni"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ],
    [
      "k",
      "stała elektrostatyczna"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001eZwiązek c, μ₀, ε₀": [
    [
      "\\varepsilon_0",
      "przenikalność elektryczna próżni"
    ],
    [
      "\\varepsilon",
      "przyspieszenie kątowe (oznaczenie CKE)"
    ],
    [
      "\\mu_0",
      "przenikalność magnetyczna próżni"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001eMasa elektronu": [
    [
      "m_e",
      "masa elektronu"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001eMasa protonu": [
    [
      "m_p",
      "masa protonu"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001eMasa neutronu": [
    [
      "m_n",
      "masa neutronu"
    ]
  ],
  "Wartości wybranych stałych fizycznych\u001eJednostka masy atomowej": [],
  "Wartości wybranych stałych fizycznych — cd.\u001ePrzyspieszenie ziemskie standardowe": [],
  "Wartości wybranych stałych fizycznych — cd.\u001eStała Wiena": [],
  "Wartości wybranych stałych fizycznych — cd.\u001eStała Stefana–Boltzmanna": [],
  "Wybrane stałe i parametry astrofizyczne\u001eJednostka astronomiczna": [],
  "Wybrane stałe i parametry astrofizyczne\u001eParsek": [],
  "Wybrane stałe i parametry astrofizyczne\u001eRok świetlny": [],
  "Wybrane stałe i parametry astrofizyczne\u001eMasa Słońca": [
    [
      "M_S",
      "masa Słońca"
    ]
  ],
  "Wybrane stałe i parametry astrofizyczne\u001eOdległość Słońca od centrum Galaktyki": [
    [
      "R_0",
      "odległość Słońca od centrum Galaktyki (szacunek)"
    ]
  ],
  "Wybrane stałe i parametry astrofizyczne\u001eMasa Ziemi": [
    [
      "M_Z",
      "masa Ziemi"
    ]
  ],
  "Wybrane stałe i parametry astrofizyczne\u001ePromień równikowy Ziemi": [
    [
      "R_Z",
      "promień równikowy Ziemi"
    ]
  ],
  "Wybrane stałe i parametry astrofizyczne\u001eStała Hubble'a": [
    [
      "H_0",
      "stała Hubble'a"
    ]
  ],
  "Wybrane stałe i parametry astrofizyczne\u001eTemperatura promieniowania tła": [],
  "Wartości wybranych jednostek spoza układu SI\u001ePrzeliczniki i stałe pomocnicze": []
};
})();
