/**
 * Fiszki wg „Wybrane wzory i stałe fizykochemiczne” (CKE, formuła 2023) —
 * strony 16–20 (fizyka): działy i nazwy jak na karcie.
 * Legenda symboli: `js/wzory-symbol-legends.js` (generowanie: `python tools/gen_wzory_symbol_legends.py`).
 */
(function () {
  "use strict";

  /** @type {{ topic: string, front: string, back: string }[]} */
  window.__WZORY_CKE_CARDS__ = [
    // —— Kinematyka ——
    { topic: "Kinematyka", front: "Prędkość", back: String.raw`\vec{v} = \dfrac{\Delta \vec{r}}{\Delta t}` },
    { topic: "Kinematyka", front: "Przyspieszenie", back: String.raw`a = \dfrac{\Delta \vec{v}}{\Delta t}` },
    { topic: "Kinematyka", front: "Prędkość kątowa", back: String.raw`\omega = \dfrac{\Delta \alpha}{\Delta t}` },
    { topic: "Kinematyka", front: "Związek prędkości kątowej i liniowej", back: String.raw`v = \omega r` },
    {
      topic: "Kinematyka",
      front: "Ruch jednostajny po okręgu (okres, częstotliwość)",
      back: String.raw`\omega = \dfrac{2\pi}{T}\,,\quad T = \dfrac{1}{f}`,
    },
    {
      topic: "Kinematyka",
      front: "Przyspieszenie dośrodkowe",
      back: String.raw`a_{\mathrm{do}} = \dfrac{v^2}{r} = v\omega = \omega^2 r`,
    },
    { topic: "Kinematyka", front: "Przyspieszenie kątowe", back: String.raw`\varepsilon = \dfrac{\Delta \omega}{\Delta t}` },
    { topic: "Kinematyka", front: "Przyspieszenie styczne", back: String.raw`a_{\mathrm{st}} = \varepsilon r` },
    {
      topic: "Kinematyka",
      front: "Prędkość w ruchu jednostajnie zmiennym prostoliniowym",
      back: String.raw`\vec{v} = \vec{v}_0 + \vec{a}\,t`,
    },
    {
      topic: "Kinematyka",
      front: "Droga w ruchu jednostajnie zmiennym prostoliniowym",
      back: String.raw`s = v_0 t + \dfrac{1}{2} a t^2`,
    },
    {
      topic: "Kinematyka",
      front: "Średnia prędkość na prostej (droga i czas)",
      back: String.raw`v_{\mathrm{śr}} = \dfrac{s}{\Delta t}`,
    },
    {
      topic: "Kinematyka",
      front: "Droga w ruchu jednostajnym prostoliniowym (skalar)",
      back: String.raw`s = v\,\Delta t`,
    },
    {
      topic: "Kinematyka",
      front: "Składowe prędkości na płaszczyźnie (wzór trygonometryczny)",
      back: String.raw`v_x = v \cos\alpha\,,\quad v_y = v \sin\alpha`,
    },
    {
      topic: "Kinematyka",
      front: "Ruch pionowy przy stałym g — wiązanie prędkości z wysokością",
      back: String.raw`v_y^2 = v_{0y}^2 - 2 g\,\Delta y`,
    },

    // —— Siły tarcia i siła sprężystości ——
    { topic: "Siły tarcia i siła sprężystości", front: "Siła tarcia kinetycznego", back: String.raw`T_k = \mu_k F_N` },
    { topic: "Siły tarcia i siła sprężystości", front: "Siła tarcia statycznego", back: String.raw`T_s \le \mu_s F_N` },
    { topic: "Siły tarcia i siła sprężystości", front: "Siła sprężystości", back: String.raw`F_s = -k x` },
    {
      topic: "Siły tarcia i siła sprężystości",
      front: "Energia potencjalna sprężystości",
      back: String.raw`E_{\mathrm{pot}} = \dfrac{1}{2} k x^2`,
    },

    // —— Dynamika ——
    { topic: "Dynamika", front: "Pęd", back: String.raw`\vec{p} = m \vec{v}` },
    {
      topic: "Dynamika",
      front: "II zasada dynamiki (układ inercjalny)",
      back: String.raw`m \vec{a} = \vec{F}\,,\quad \dfrac{\Delta \vec{p}}{\Delta t} = \vec{F}`,
    },
    {
      topic: "Dynamika",
      front: "Wartość momentu pędu punktu materialnego",
      back: String.raw`L = r p \sin \angle(\vec{r}, \vec{p})`,
    },
    {
      topic: "Dynamika",
      front: "Wartość momentu siły",
      back: String.raw`M = r F \sin \angle(\vec{r}, \vec{F})`,
    },
    {
      topic: "Dynamika",
      front: "Moment bezwładności",
      back: String.raw`I = \sum_{i=1}^{n} m_i r_i^2`,
    },
    { topic: "Dynamika", front: "Moment pędu bryły sztywnej", back: String.raw`L = I \omega` },
    { topic: "Dynamika", front: "II zasada dynamiki ruchu obrotowego (zapis skalarny)", back: String.raw`I \varepsilon = M` },
    {
      topic: "Dynamika",
      front: "Praca siły",
      back: String.raw`W_F = F\,\Delta r \cos \angle(\vec{F}, \Delta \vec{r})`,
    },
    { topic: "Dynamika", front: "Praca momentu siły", back: String.raw`W_M = M\,\Delta \alpha` },
    { topic: "Dynamika", front: "Moc", back: String.raw`P = \dfrac{W}{\Delta t}` },
    {
      topic: "Dynamika",
      front: "Siła nacisku przy przyspieszeniu układu w kierunku pionowym",
      back: String.raw`F_N = m(g \pm a)\quad (\text{górny znak, gdy układ przyspiesza w górę})`,
    },
    {
      topic: "Dynamika",
      front: "Energia kinetyczna ruchu postępowego",
      back: String.raw`E_{\mathrm{kin}} = \dfrac{1}{2} m v^2`,
    },
    {
      topic: "Dynamika",
      front: "Energia kinetyczna ruchu obrotowego",
      back: String.raw`E_{\mathrm{kin}} = \dfrac{1}{2} I \omega^2`,
    },

    // —— Grawitacja i elementy astronomii ——
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Prawo powszechnego ciążenia",
      back: String.raw`F_g = G \dfrac{m_1 m_2}{r^2}`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Natężenie pola grawitacyjnego i przyspieszenie grawitacyjne",
      back: String.raw`\gamma = \dfrac{F_g}{m}\,,\quad a_g = \gamma`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Energia potencjalna grawitacji",
      back: String.raw`E_{\mathrm{pot}} = -G \dfrac{m_1 m_2}{r}`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Zmiana energii potencjalnej przy powierzchni Ziemi",
      back: String.raw`\Delta E_p = m g \Delta h`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Prędkość na orbicie kołowej",
      back: String.raw`v_{\mathrm{or}} = \sqrt{\dfrac{G M}{r}}`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Prędkość ucieczki",
      back: String.raw`v_u = \sqrt{\dfrac{2 G M}{r}}`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "II prawo Keplera i zachowanie momentu pędu na orbicie",
      back: String.raw`\dfrac{\Delta S}{\Delta t} = \mathrm{const}\,,\quad \vec{L} = \mathrm{const}`,
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "III prawo Keplera",
      back: String.raw`\dfrac{T_1^2}{a_1^3} = \dfrac{T_2^2}{a_2^3} = \mathrm{const}`,
    },
    { topic: "Grawitacja i elementy astronomii", front: "Prawo Hubble'a", back: String.raw`v = H d` },

    // —— Drgania, fale mechaniczne i świetlne ——
    { topic: "Drgania, fale mechaniczne i świetlne", front: "Maksymalne wychylenie (amplituda)", back: String.raw`x_{\max} = A` },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Położenie w ruchu harmonicznym",
      back: String.raw`x(t) = A \sin(\omega t + \varphi_0)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Prędkość w ruchu harmonicznym",
      back: String.raw`v(t) = A \omega \cos(\omega t + \varphi_0)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Przyspieszenie w ruchu harmonicznym",
      back: String.raw`a(t) = -A \omega^2 \sin(\omega t + \varphi_0)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Maksima prędkości i przyspieszenia (drgania)",
      back: String.raw`v_{\max} = A \omega\,,\quad a_{\max} = A \omega^2`,
    },
    { topic: "Drgania, fale mechaniczne i świetlne", front: "Siła harmoniczna", back: String.raw`F_h = -m \omega^2 x` },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Częstość kołowa małych drgań (sprężyna, wahadło matematyczne)",
      back: String.raw`\omega = \sqrt{\dfrac{k}{m}}\,,\quad \omega = \sqrt{\dfrac{g}{\ell}}`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Energia mechaniczna oscylatora",
      back: String.raw`E = E_k + E_p = \dfrac{1}{2} m A^2 \omega^2`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Prędkość fali (długość, okres, częstotliwość)",
      back: String.raw`v = \dfrac{\lambda}{T} = \lambda f\,,\quad T = \dfrac{1}{f}`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Faza fali w punkcie i chwili",
      back: String.raw`\varphi(t) = \dfrac{2\pi}{T} t - \dfrac{2\pi}{\lambda} x + \varphi_0`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Warunek wzmocnienia interferencyjnego",
      back: String.raw`\varphi_2 - \varphi_1 = 2\pi n`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Warunek osłabienia interferencyjnego",
      back: String.raw`\varphi_2 - \varphi_1 = 2\pi \Bigl(n + \dfrac{1}{2}\Bigr)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Natężenie fali (średnie) i zależność od amplitudy",
      back: String.raw`I = \dfrac{E}{S\,\Delta t}\,,\quad I \propto A^2`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Natężenie fali kulistej a odległość",
      back: String.raw`I \propto \dfrac{1}{r^2}`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Prawo Snelliusa (załamanie na granicy ośrodków)",
      back: String.raw`\dfrac{\sin \alpha_1}{\sin \alpha_2} = \dfrac{v_1}{v_2} = \dfrac{n_2}{n_1}`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Doppler (dźwięk) — przybliżenie, źródło oddala się",
      back: String.raw`f_{\mathrm{ob}} \approx f_{\mathrm{źr}} \Bigl(1 - \dfrac{|v_{\mathrm{źr}} - v_{\mathrm{ob}}|}{v_d}\Bigr)\quad (v_{\mathrm{źr}} \ll v_d)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Doppler (dźwięk) — przybliżenie, źródło zbliża się",
      back: String.raw`f_{\mathrm{ob}} \approx f_{\mathrm{źr}} \Bigl(1 + \dfrac{|v_{\mathrm{źr}} - v_{\mathrm{ob}}|}{v_d}\Bigr)\quad (v_{\mathrm{źr}} \ll v_d)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Doppler (światło) — przybliżenie, źródło oddala się",
      back: String.raw`f_{\mathrm{ob}} \approx f_{\mathrm{źr}} \Bigl(1 - \dfrac{v_{\mathrm{źr}}}{c}\Bigr)\quad (v_{\mathrm{źr}} \ll c)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Doppler (światło) — przybliżenie, źródło zbliża się",
      back: String.raw`f_{\mathrm{ob}} \approx f_{\mathrm{źr}} \Bigl(1 + \dfrac{v_{\mathrm{źr}}}{c}\Bigr)\quad (v_{\mathrm{źr}} \ll c)`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Doppler — wzory ścisłe (dźwięk i światło, kierunek prędkości źródła)",
      back: String.raw`f_{\mathrm{ob}} = f_{\mathrm{źr}} \dfrac{v_d \mp v_{\mathrm{ob}}}{v_d \pm v_{\mathrm{źr}}}\,,\quad f_{\mathrm{ob}} = f_{\mathrm{źr}} \sqrt{\dfrac{c \mp v_{\mathrm{źr}}}{c \pm v_{\mathrm{źr}}}}`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Siatka dyfrakcyjna",
      back: String.raw`d \sin \alpha_n = n \lambda`,
    },
    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Światło po przejściu przez polaryzator (oznaczenia amplitud)",
      back: String.raw`\vec{E}_0\ \text{— padające},\quad \vec{E}_P\ \text{— po przejściu przez polaryzator o osi } P`,
    },

    // —— Optyka geometryczna ——
    {
      topic: "Optyka geometryczna",
      front: "Kąt graniczny (przejście z ośrodka 2 do 1)",
      back: String.raw`\sin \alpha_{2\,\mathrm{gr}} = \dfrac{n_1}{n_2}`,
    },
    {
      topic: "Optyka geometryczna",
      front: "Warunek polaryzacji światła przy odbiciu (kąt Brewstera)",
      back: String.raw`\alpha_{\mathrm{pad}\,1} + \alpha_{\mathrm{zał}\,2} = 90^\circ`,
    },
    {
      topic: "Optyka geometryczna",
      front: "Równanie soczewki i zwierciadła",
      back: String.raw`\dfrac{1}{x} + \dfrac{1}{y} = \dfrac{1}{f}\quad (x>0,\ y \gtrless 0,\ f \gtrless 0\ \text{— znaki wg typu obrazu i optyki})`,
    },
    {
      topic: "Optyka geometryczna",
      front: "Wzór na ogniskową soczewki (promienie krzywizny, środowiska)",
      back: String.raw`\dfrac{1}{f} = \Bigl(\dfrac{n_{\mathrm{socz}}}{n_{\mathrm{otocz}}} - 1\Bigr) \Bigl(\pm \dfrac{1}{R_1} \pm \dfrac{1}{R_2}\Bigr)`,
    },

    // —— Hydrostatyka, aerostatyka ——
    {
      topic: "Hydrostatyka, aerostatyka",
      front: "Siła parcia i ciśnienie",
      back: String.raw`F = p\,\Delta S\,,\quad \vec{F} \perp \Delta \vec{S}`,
    },
    {
      topic: "Hydrostatyka, aerostatyka",
      front: "Zmiana ciśnienia hydro- i aerostatycznego",
      back: String.raw`\Delta p = \rho g \Delta h`,
    },
    {
      topic: "Hydrostatyka, aerostatyka",
      front: "Siła wyporu (Archimedes)",
      back: String.raw`F_{\mathrm{wyp}} = \rho\, V_{\mathrm{zan}}\, g`,
    },
    { topic: "Hydrostatyka, aerostatyka", front: "Gęstość substancji", back: String.raw`\rho = \dfrac{m}{V}` },
    {
      topic: "Hydrostatyka, aerostatyka",
      front: "Ciśnienie (definicja mechaniczna)",
      back: String.raw`p = \dfrac{F}{\Delta S}`,
    },

    // —— Termodynamika ——
    { topic: "Termodynamika", front: "I zasada termodynamiki", back: String.raw`\Delta U = Q + W` },
    {
      topic: "Termodynamika",
      front: "Praca siły parcia przy stałym ciśnieniu",
      back: String.raw`|W| = p\,|\Delta V|`,
    },
    {
      topic: "Termodynamika",
      front: "Praca siły parcia a wykres p(V)",
      back: String.raw`|W_{AB}| = \text{pole pod odcinkiem } AB`,
    },
    { topic: "Termodynamika", front: "Ciepło właściwe", back: String.raw`c_w = \dfrac{Q}{m\,\Delta T}` },
    { topic: "Termodynamika", front: "Ciepło molowe", back: String.raw`C = \dfrac{Q}{n\,\Delta T}` },
    { topic: "Termodynamika", front: "Ciepło przemiany fazowej", back: String.raw`L = \dfrac{Q}{m}` },
    {
      topic: "Termodynamika",
      front: "Średnia energia ruchu cząsteczki gazu doskonałego",
      back: String.raw`E_{\mathrm{śr}} = \dfrac{s}{2} k_B T\quad (s\ \text{— liczba współrzędnych położenia cząsteczki})`,
    },
    { topic: "Termodynamika", front: "Równanie stanu gazu doskonałego (Clapeyrona)", back: String.raw`p V = n R T` },
    {
      topic: "Termodynamika",
      front: "Związek ciepeł molowych gazu doskonałego",
      back: String.raw`C_p = C_V + R`,
    },
    {
      topic: "Termodynamika",
      front: "Praca i ciepło w cyklu (silnik / pompa cieplna)",
      back: String.raw`0 = Q_{\mathrm{calk}} + W_{\mathrm{calk}}`,
    },
    {
      topic: "Termodynamika",
      front: "Sprawność silnika cieplnego",
      back: String.raw`\eta = \dfrac{|W_{\mathrm{calk}}|}{|Q_{\mathrm{pob}}|} = \dfrac{|Q_{\mathrm{pob}}| - |Q_{\mathrm{odd}}|}{|Q_{\mathrm{pob}}|}`,
    },

    // —— Elektrostatyka ——
    {
      topic: "Elektrostatyka",
      front: "Prawo Coulomba i stała elektrostatyczna",
      back: String.raw`F_e = k \dfrac{q_1 q_2}{r^2}\,,\quad k = \dfrac{1}{4\pi \varepsilon_0}`,
    },
    { topic: "Elektrostatyka", front: "Natężenie pola elektrycznego", back: String.raw`\vec{E} = \dfrac{\vec{F}_e}{q}` },
    {
      topic: "Elektrostatyka",
      front: "Natężenie pola na zewnątrz sferycznego rozkładu ładunku",
      back: String.raw`E = k \dfrac{Q}{r^2}`,
    },
    {
      topic: "Elektrostatyka",
      front: "Napięcie między punktami A i B (praca na ładunek)",
      back: String.raw`U_{AB} = \dfrac{W_{AB}}{q}`,
    },
    {
      topic: "Elektrostatyka",
      front: "Napięcie a potencjały elektryczne",
      back: String.raw`U_{AB} = V_B - V_A`,
    },
    {
      topic: "Elektrostatyka",
      front: "Energia potencjalna elektryczna układu ładunków",
      back: String.raw`E_{\mathrm{pot}} = k \dfrac{q_1 q_2}{r}`,
    },
    { topic: "Elektrostatyka", front: "Napięcie w polu jednorodnym", back: String.raw`U = E d` },
    {
      topic: "Elektrostatyka",
      front: "Natężenie pola między płytami naładowanymi różnoimiennie",
      back: String.raw`E = \dfrac{\sigma}{\varepsilon_0}\,,\quad \sigma = \dfrac{Q}{\Delta S} = \mathrm{const}`,
    },
    {
      topic: "Elektrostatyka",
      front: "Natężenie pola wewnątrz dielektryka",
      back: String.raw`\vec{E} = \dfrac{\vec{E}_0}{\varepsilon_r}`,
    },
    { topic: "Elektrostatyka", front: "Pojemność kondensatora", back: String.raw`C = \dfrac{Q}{U}` },
    {
      topic: "Elektrostatyka",
      front: "Pojemność kondensatora płaskiego z dielektrykiem",
      back: String.raw`C = \dfrac{\varepsilon_r \varepsilon_0 S}{d}`,
    },
    {
      topic: "Elektrostatyka",
      front: "Energia elektryczna kondensatora",
      back: String.raw`W = \dfrac{Q^2}{2C} = \dfrac{1}{2} Q U = \dfrac{1}{2} U^2 C`,
    },
    {
      topic: "Elektrostatyka",
      front: "Pole wewnątrz i na powierzchni przewodnika (równowaga)",
      back: String.raw`\vec{E}_{\mathrm{wew}} = 0\,,\quad \vec{E}_{\mathrm{pow}} \perp \Delta \vec{S}`,
    },

    // —— Prąd elektryczny ——
    { topic: "Prąd elektryczny", front: "Natężenie prądu", back: String.raw`I = \dfrac{\Delta Q}{\Delta t}` },
    { topic: "Prąd elektryczny", front: "Definicja oporu przewodnika", back: String.raw`R = \dfrac{U}{I}` },
    {
      topic: "Prąd elektryczny",
      front: "Prawo Ohma (dla stałej temperatury przewodnika)",
      back: String.raw`\dfrac{U}{I} = \mathrm{const}`,
    },
    { topic: "Prąd elektryczny", front: "Opór przewodnika z drutu", back: String.raw`R = \rho \dfrac{\ell}{S}` },
    {
      topic: "Prąd elektryczny",
      front: "Moc prądu stałego na oporniku",
      back: String.raw`P = U I = I^2 R = \dfrac{U^2}{R}`,
    },
    {
      topic: "Prąd elektryczny",
      front: "Opór metali a temperatura (liniowy przybliżony model)",
      back: String.raw`R(T) = R(T_0)\bigl(1 + \alpha \Delta T\bigr)\,,\quad \Delta T = T - T_0`,
    },
    {
      topic: "Prąd elektryczny",
      front: "Dodawanie napięć między punktami przewodnika",
      back: String.raw`U_{AC} = U_{AB} + U_{BC}`,
    },
    {
      topic: "Prąd elektryczny",
      front: "II prawo Kirchhoffa dla obwodu (oczka)",
      back: String.raw`\sum_{i=1}^{k} (\pm \mathcal{E}_i) - \sum_{j=1}^{n} (\pm U_j) = 0`,
    },
    {
      topic: "Prąd elektryczny",
      front: "SEM a napięcie na zaciskach baterii",
      back: String.raw`\mathcal{E} = U + I R_w`,
    },
    {
      topic: "Prąd elektryczny",
      front: "Opór zastępczy połączenia szeregowego",
      back: String.raw`R_z = \sum_{i=1}^{n} R_i`,
    },
    {
      topic: "Prąd elektryczny",
      front: "Opór zastępczy połączenia równoległego",
      back: String.raw`\dfrac{1}{R_z} = \sum_{i=1}^{n} \dfrac{1}{R_i}`,
    },

    // —— Magnetyzm ——
    {
      topic: "Magnetyzm",
      front: "Siła Lorentza (wartość; kąt między v i B)",
      back: String.raw`F = |q| v B \sin \alpha\quad (\vec{F} \perp \vec{v},\ \vec{F} \perp \vec{B})`,
    },
    {
      topic: "Magnetyzm",
      front: "Siła elektrodynamiczna na odcinku przewodnika",
      back: String.raw`F = I \Delta \ell B \sin \angle(\Delta \vec{\ell}, \vec{B})`,
    },
    {
      topic: "Magnetyzm",
      front: "Pole magnetyczne długiego prostoliniowego przewodnika",
      back: String.raw`B = \dfrac{\mu_0 I}{2\pi r}`,
    },
    {
      topic: "Magnetyzm",
      front: "Pole wewnątrz długiej ciasnej zwojnicy",
      back: String.raw`B = \dfrac{\mu_0 N I}{L}`,
    },
    {
      topic: "Magnetyzm",
      front: "Moment siły na pętlę z prądem w polu B",
      back: String.raw`M = I S B \sin \angle(\vec{S}, \vec{B})`,
    },
    {
      topic: "Magnetyzm",
      front: "Strumień magnetyczny przez powierzchnię",
      back: String.raw`\Phi_B = B S \cos \angle(\vec{S}, \vec{B})`,
    },
    {
      topic: "Magnetyzm",
      front: "SEM indukcji (Faraday–Lenz)",
      back: String.raw`\mathcal{E} = -\dfrac{\Delta \Phi_B}{\Delta t}`,
    },
    {
      topic: "Magnetyzm",
      front: "SEM prądnicy (obrót w polu magnetycznym)",
      back: String.raw`\mathcal{E} = N B S \omega \sin \angle(\vec{S}, \vec{B})\,,\quad \angle(\vec{S}, \vec{B}) = \omega t + \varphi_0`,
    },
    {
      topic: "Magnetyzm",
      front: "Praca prądu sinusoidalnego w czasie jednego okresu",
      back: String.raw`W = \dfrac{1}{2} U_0 I_0 T`,
    },
    {
      topic: "Magnetyzm",
      front: "Wartości skuteczne prądu i napięcia (sinus)",
      back: String.raw`I_{\mathrm{sk}} = \dfrac{I_0}{\sqrt{2}}\,,\quad U_{\mathrm{sk}} = \dfrac{U_0}{\sqrt{2}}`,
    },
    {
      topic: "Magnetyzm",
      front: "Uproszczony model transformatora",
      back: String.raw`I_1 U_1 = I_2 U_2\,,\quad \dfrac{U_1}{U_2} = \dfrac{N_1}{N_2}`,
    },

    // —— Elementy mechaniki relatywistycznej ——
    {
      topic: "Elementy mechaniki relatywistycznej",
      front: "Energia całkowita ciała (relatywistyczna)",
      back: String.raw`E = \dfrac{m c^2}{\sqrt{1 - v^2/c^2}}\,,\quad v = \dfrac{\Delta x}{\Delta t}`,
    },
    {
      topic: "Elementy mechaniki relatywistycznej",
      front: "Energia spoczynkowa",
      back: String.raw`E_0 = m c^2`,
    },
    {
      topic: "Elementy mechaniki relatywistycznej",
      front: "Równoważność zmiany masy i energii",
      back: String.raw`\Delta E = \Delta m\, c^2`,
    },
    {
      topic: "Elementy mechaniki relatywistycznej",
      front: "Pęd relatywistyczny",
      back: String.raw`p = \dfrac{m v}{\sqrt{1 - v^2/c^2}}\,,\quad v = \dfrac{\Delta x}{\Delta t}`,
    },
    {
      topic: "Elementy mechaniki relatywistycznej",
      front: "Niezmiennik relatywistyczny (dynamiczny)",
      back: String.raw`E_0^2 = E^2 - (c p)^2`,
    },
    {
      topic: "Elementy mechaniki relatywistycznej",
      front: "Energia kinetyczna",
      back: String.raw`E_{\mathrm{kin}} = E - E_0`,
    },

    // —— Elementy fizyki atomowej i jądrowej ——
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Prawo Wiena",
      back: String.raw`\lambda_{\max} T = b`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Prawo Stefana–Boltzmanna (moc z jednostki powierzchni)",
      back: String.raw`I = \sigma T^4\,,\quad [I] = \mathrm{W/m^2}`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Energia i pęd fotonu",
      back: String.raw`E_f = h f = \dfrac{h c}{\lambda}\,,\quad p_f = \dfrac{h}{\lambda}`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Zjawisko fotoelektryczne",
      back: String.raw`E_f = W_{\mathrm{el}} + E_{\mathrm{kin\,el\,max}}`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Emisja lub absorpcja fotonu przez atom",
      back: String.raw`E_m - E_n = h f_{mn} + E_{\mathrm{odrzutu}}\quad (m>n)`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Poziomy energetyczne atomu wodoru",
      back: String.raw`E_n = -\dfrac{13.606\ \mathrm{eV}}{n^2}`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Długość fali de Broglie'a",
      back: String.raw`\lambda = \dfrac{h}{p}`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Zasady zachowania (wybrane, poziom fundamentalny)",
      back: String.raw`\begin{array}{l}\text{zachowanie ładunku układu}\\\text{zachowanie energii układu}\\\text{zachowanie pędu układu}\\\text{zachowanie liczby nukleonów w układzie}\end{array}`,
    },
    {
      topic: "Elementy fizyki atomowej i jądrowej",
      front: "Statystyczne prawo rozpadu promieniotwórczego",
      back: String.raw`N(t) = N_0 \left(\dfrac{1}{2}\right)^{t/T}`,
    },

    // —— Wybrane zależności ——
    {
      topic: "Wybrane zależności",
      front: "Środek masy układu punktów materialnych",
      back: String.raw`\vec{r}_{\mathrm{SM}} = \dfrac{\sum_{i=1}^{n} m_i \vec{r}_i}{\sum_{i=1}^{n} m_i}`,
    },
    {
      topic: "Wybrane zależności",
      front: "Droga a pole pod wykresem v(t)",
      back: String.raw`s_{AB} = \text{pole pod odcinkiem } AB`,
    },
    {
      topic: "Wybrane zależności",
      front: "Praca a pole pod wykresem F(s)",
      back: String.raw`|W_{AB}| = \text{pole pod odcinkiem } AB`,
    },
    {
      topic: "Wybrane zależności",
      front: "Praca a pole pod wykresem P(t)",
      back: String.raw`|W_{AB}| = \text{pole pod odcinkiem } AB`,
    },
    {
      topic: "Wybrane zależności",
      front: "Dodawanie i odejmowanie wektorów (konstrukcje)",
      back: String.raw`\text{Równoległobok, trójkąt, przeniesienie równoległe, rozkład na składowe}`,
    },

    // —— Jednostki SI i przedrostki ——
    {
      topic: "Podstawowe jednostki SI",
      front: "Siedem jednostek podstawowych",
      back: String.raw`\begin{array}{ll}\text{m} & \text{metr — długość}\\\text{kg} & \text{kilogram — masa}\\\text{s} & \text{sekunda — czas}\\\text{A} & \text{amper — natężenie prądu}\\\text{K} & \text{kelwin — temperatura}\\\text{mol} & \text{mol — liczność materii}\\\text{cd} & \text{kandela — światłość}\end{array}`,
    },
    {
      topic: "Przedrostki jednostek miar",
      front: "Nazwy i oznaczenia (wybrane)",
      back: String.raw`\begin{array}{llll}\text{Y} & 10^{24} & \text{y} & 10^{-24}\\\text{Z} & 10^{21} & \text{z} & 10^{-21}\\\text{E} & 10^{18} & \text{a} & 10^{-18}\\\text{P} & 10^{15} & \text{f} & 10^{-15}\\\text{T} & 10^{12} & \text{p} & 10^{-12}\\\text{G} & 10^{9} & \text{n} & 10^{-9}\\\text{M} & 10^{6} & \mu & 10^{-6}\\\text{k} & 10^{3} & \text{m} & 10^{-3}\\\text{h} & 10^{2} & \text{c} & 10^{-2}\\\text{da} & 10^{1} & \text{d} & 10^{-1}\end{array}`,
    },

    // —— Stałe fizyczne ——
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Prędkość światła w próżni",
      back: String.raw`c = 299\,792\,458\ \mathrm{m/s}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Stała Plancka",
      back: String.raw`h = 6{,}626\,070\,15 \cdot 10^{-34}\ \mathrm{J\cdot s}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Ładunek elementarny",
      back: String.raw`e = 1{,}602\,176\,634 \cdot 10^{-19}\ \mathrm{C}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Stała Boltzmanna",
      back: String.raw`k_B = 1{,}380\,649 \cdot 10^{-23}\ \mathrm{J/K}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Stała Avogadra",
      back: String.raw`N_A = 6{,}022\,140\,76 \cdot 10^{23}\ \mathrm{mol^{-1}}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Uniwersalna stała gazowa",
      back: String.raw`R = 8{,}314\,462\,618\,2\ \mathrm{J/(K\cdot mol)}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Stała grawitacji",
      back: String.raw`G = 6{,}674 \cdot 10^{-11}\ \mathrm{N\cdot m^2 / kg^2}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Przenikalność magnetyczna próżni",
      back: String.raw`\mu_0 = 4\pi \cdot 10^{-7}\ \mathrm{N/A^2}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Przenikalność elektryczna próżni i stała k",
      back: String.raw`\varepsilon_0 = 8{,}854\,187\,81 \cdot 10^{-12}\ \mathrm{C^2/(N\cdot m^2)}\,,\quad k = \dfrac{1}{4\pi\varepsilon_0} = 8{,}987\,551\,8 \cdot 10^9\ \mathrm{N\cdot m^2/C^2}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Związek c, μ₀, ε₀",
      back: String.raw`c^2 = \dfrac{1}{\varepsilon_0 \mu_0}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Masa elektronu",
      back: String.raw`m_e = 9{,}109\,383\,7 \cdot 10^{-31}\ \mathrm{kg}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Masa protonu",
      back: String.raw`m_p = 1{,}672\,621\,92 \cdot 10^{-27}\ \mathrm{kg}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Masa neutronu",
      back: String.raw`m_n = 1{,}674\,927\,49 \cdot 10^{-27}\ \mathrm{kg}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych",
      front: "Jednostka masy atomowej",
      back: String.raw`1\ \mathrm{u} = 1{,}660\,539\,066 \cdot 10^{-27}\ \mathrm{kg}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych — cd.",
      front: "Przyspieszenie ziemskie standardowe",
      back: String.raw`g = 9{,}806\,65\ \mathrm{m/s^2}\quad \text{(wartość dokładna wg karty)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych — cd.",
      front: "Stała Wiena",
      back: String.raw`b = 2{,}897\,771\,955\ldots \cdot 10^{-3}\ \mathrm{m\cdot K}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wartości wybranych stałych fizycznych — cd.",
      front: "Stała Stefana–Boltzmanna",
      back: String.raw`\sigma = 5{,}670\,374\,419\ldots \cdot 10^{-8}\ \mathrm{W/(m^2\cdot K^4)}\quad \text{(wartość dokładna)}`,
    },

    // —— Astrofizyka i jednostki poza SI ——
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Jednostka astronomiczna",
      back: String.raw`1\ \mathrm{au} = 1{,}495\,978\,707 \cdot 10^{11}\ \mathrm{m}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Parsek",
      back: String.raw`1\ \mathrm{pc} = 3{,}085\,677\,581\,49 \cdot 10^{16}\ \mathrm{m}\quad \text{(wartość dokładna)}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Rok świetlny",
      back: String.raw`1\ \mathrm{ly} = 0{,}946\,073\ldots \cdot 10^{16}\ \mathrm{m} = 0{,}306\,601\ldots\ \mathrm{pc}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Masa Słońca",
      back: String.raw`M_S = 1{,}988 \cdot 10^{30}\ \mathrm{kg}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Odległość Słońca od centrum Galaktyki",
      back: String.raw`R_0 \approx 27\ \mathrm{kly}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Masa Ziemi",
      back: String.raw`M_Z = 5{,}972 \cdot 10^{24}\ \mathrm{kg}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Promień równikowy Ziemi",
      back: String.raw`R_Z = 6{,}378 \cdot 10^{6}\ \mathrm{m}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Stała Hubble'a",
      back: String.raw`H_0 \approx 70\ \mathrm{(km/s)/Mpc}`,
    },
    {
      topic: "Wybrane stałe i parametry astrofizyczne",
      front: "Temperatura promieniowania tła",
      back: String.raw`T_0 = 2{,}7\ \mathrm{K}`,
    },
    {
      topic: "Wartości wybranych jednostek spoza układu SI",
      front: "Przeliczniki i stałe pomocnicze",
      back: String.raw`\begin{array}{l}1\ \mathrm{eV} = 1{,}602\,176\,634 \cdot 10^{-19}\ \mathrm{J}\ \text{(dokładnie)}\\0^\circ\mathrm{C} \equiv 273{,}15\ \mathrm{K}\\1\ \mathrm{atm} \equiv 101\,325\ \mathrm{Pa}\\1\ \mathrm{G} \equiv 10^{-4}\ \mathrm{T}\\1\ \mathrm{\AA} = 0{,}1\ \mathrm{nm}\\\pi = 3{,}141\,592\,653\,589\,793\ldots\\e = 2{,}718\,281\,828\,459\,045\ldots\end{array}`,
    },
  ];
})();
