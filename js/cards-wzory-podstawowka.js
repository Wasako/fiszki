/**
 * Wzory z „wzory fizyka - podstawowka.pdf” (gimnazjum / podstawa liceum).
 * Pola `ckeRef`: [topic, front] — przy generacji JSON używany jest zapis z karty maturalnej (CKE).
 * `showSp: false` — ukryte w „Szkoła podstawowa”.
 */
(function () {
  "use strict";

  /** @type {{ topic: string, front: string, back?: string, ckeRef?: [string, string], showSp?: boolean }[]} */
  window.__WZORY_PODSTAWOWKA_CARDS__ = [
    {
      topic: "Wybrane wzory — gimnazjum",
      front: "Ciężar ciała",
      back: String.raw`F_g = m g`,
      showSp: true,
    },
    { topic: "Hydrostatyka, aerostatyka", front: "Gęstość substancji", ckeRef: ["Hydrostatyka, aerostatyka", "Gęstość substancji"] },
    { topic: "Hydrostatyka, aerostatyka", front: "Ciśnienie (definicja mechaniczna)", ckeRef: ["Hydrostatyka, aerostatyka", "Ciśnienie (definicja mechaniczna)"] },
    {
      topic: "Hydrostatyka, aerostatyka",
      front: "Ciśnienie hydrostatyczne",
      ckeRef: ["Hydrostatyka, aerostatyka", "Zmiana ciśnienia hydro- i aerostatycznego"],
    },
    {
      topic: "Hydrostatyka, aerostatyka",
      front: "Ciśnienie w cieczy na głębokości (z ciśnieniem atmosferycznym)",
      back: String.raw`p = p_b + \rho g h`,
      showSp: false,
    },
    { topic: "Hydrostatyka, aerostatyka", front: "Siła wyporu (Archimedes)", ckeRef: ["Hydrostatyka, aerostatyka", "Siła wyporu (Archimedes)"] },

    { topic: "Kinematyka", front: "Droga w ruchu jednostajnym prostoliniowym (skalar)", ckeRef: ["Kinematyka", "Droga w ruchu jednostajnym prostoliniowym (skalar)"] },
    { topic: "Kinematyka", front: "Średnia prędkość na prostej (droga i czas)", ckeRef: ["Kinematyka", "Średnia prędkość na prostej (droga i czas)"] },
    {
      topic: "Kinematyka",
      front: "Prędkość chwilowa",
      back: String.raw`v_{\mathrm{ch}} = \dfrac{\Delta s}{\Delta t}\quad (\Delta t \to 0)`,
      showSp: false,
    },
    { topic: "Kinematyka", front: "Przyspieszenie", ckeRef: ["Kinematyka", "Przyspieszenie"] },
    {
      topic: "Kinematyka",
      front: "Droga w ruchu jednostajnie przyspieszonym (bez prędkości początkowej)",
      back: String.raw`s = \dfrac{1}{2} a t^2`,
    },
    {
      topic: "Kinematyka",
      front: "Prędkość w ruchu jednostajnie przyspieszonym (bez prędkości początkowej)",
      back: String.raw`v = a t`,
    },
    {
      topic: "Kinematyka",
      front: "Ruch jednostajnie opóźniony — droga",
      back: String.raw`s = v_p t - \dfrac{1}{2} a t^2`,
      showSp: false,
    },
    {
      topic: "Kinematyka",
      front: "Ruch jednostajnie opóźniony — prędkość",
      back: String.raw`v = v_p - a t`,
      showSp: false,
    },
    {
      topic: "Kinematyka",
      front: "Spadek swobodny — prędkość i droga",
      back: String.raw`v = g t\,,\quad h = \dfrac{1}{2} g t^2`,
    },
    { topic: "Kinematyka", front: "Ruch jednostajny po okręgu (okres, częstotliwość)", ckeRef: ["Kinematyka", "Ruch jednostajny po okręgu (okres, częstotliwość)"] },

    { topic: "Dynamika", front: "II zasada dynamiki (układ inercjalny)", ckeRef: ["Dynamika", "II zasada dynamiki (układ inercjalny)"] },
    { topic: "Dynamika", front: "Pęd", ckeRef: ["Dynamika", "Pęd"] },
    { topic: "Dynamika", front: "Praca siły", ckeRef: ["Dynamika", "Praca siły"] },
    { topic: "Dynamika", front: "Moc", ckeRef: ["Dynamika", "Moc"] },
    { topic: "Dynamika", front: "Energia kinetyczna ruchu postępowego", ckeRef: ["Dynamika", "Energia kinetyczna ruchu postępowego"] },

    {
      topic: "Grawitacja i elementy astronomii",
      front: "Prawo powszechnego ciążenia",
      ckeRef: ["Grawitacja i elementy astronomii", "Prawo powszechnego ciążenia"],
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Energia potencjalna grawitacji",
      ckeRef: ["Grawitacja i elementy astronomii", "Energia potencjalna grawitacji"],
    },
    {
      topic: "Grawitacja i elementy astronomii",
      front: "Zmiana energii potencjalnej przy powierzchni Ziemi",
      ckeRef: ["Grawitacja i elementy astronomii", "Zmiana energii potencjalnej przy powierzchni Ziemi"],
    },

    { topic: "Termodynamika", front: "I zasada termodynamiki", ckeRef: ["Termodynamika", "I zasada termodynamiki"] },
    { topic: "Termodynamika", front: "Ciepło właściwe", ckeRef: ["Termodynamika", "Ciepło właściwe"] },
    {
      topic: "Termodynamika",
      front: "Ciepło potrzebne do ogrzania masy",
      back: String.raw`Q = c_w m \Delta T`,
    },
    { topic: "Termodynamika", front: "Ciepło przemiany fazowej", ckeRef: ["Termodynamika", "Ciepło przemiany fazowej"] },
    {
      topic: "Termodynamika",
      front: "Ciepło topnienia",
      back: String.raw`Q = c_t m`,
      showSp: false,
    },
    {
      topic: "Termodynamika",
      front: "Ciepło krzepnięcia",
      back: String.raw`Q = c_k m`,
      showSp: false,
    },
    {
      topic: "Termodynamika",
      front: "Ciepło parowania",
      back: String.raw`Q = c_p m`,
      showSp: false,
    },
    {
      topic: "Termodynamika",
      front: "Ciepło skraplania",
      back: String.raw`Q = c_s m`,
      showSp: false,
    },

    {
      topic: "Drgania, fale mechaniczne i świetlne",
      front: "Związek okresu i częstotliwości",
      back: String.raw`f = \dfrac{1}{T}\,,\quad T = \dfrac{1}{f}`,
    },
    { topic: "Drgania, fale mechaniczne i świetlne", front: "Prędkość fali (długość, okres, częstotliwość)", ckeRef: ["Drgania, fale mechaniczne i świetlne", "Prędkość fali (długość, okres, częstotliwość)"] },

    {
      topic: "Elektrostatyka",
      front: "Prawo Coulomba i stała elektrostatyczna",
      ckeRef: ["Elektrostatyka", "Prawo Coulomba i stała elektrostatyczna"],
    },

    { topic: "Prąd elektryczny", front: "Natężenie prądu", ckeRef: ["Prąd elektryczny", "Natężenie prądu"] },
    { topic: "Prąd elektryczny", front: "Definicja oporu przewodnika", ckeRef: ["Prąd elektryczny", "Definicja oporu przewodnika"] },
    { topic: "Prąd elektryczny", front: "Prawo Ohma (dla stałej temperatury przewodnika)", ckeRef: ["Prąd elektryczny", "Prawo Ohma (dla stałej temperatury przewodnika)"] },
    { topic: "Prąd elektryczny", front: "Opór przewodnika z drutu", ckeRef: ["Prąd elektryczny", "Opór przewodnika z drutu"] },
    { topic: "Prąd elektryczny", front: "Moc prądu stałego na oporniku", ckeRef: ["Prąd elektryczny", "Moc prądu stałego na oporniku"] },
    {
      topic: "Prąd elektryczny",
      front: "Praca prądu elektrycznego",
      back: String.raw`W = U I t`,
    },
    {
      topic: "Prąd elektryczny",
      front: "Energia prądu elektrycznego",
      back: String.raw`E_{\mathrm{el}} = Q U`,
      showSp: false,
    },
    {
      topic: "Prąd elektryczny",
      front: "Sprawność urządzenia",
      back: String.raw`\eta = \dfrac{W_u}{W_d} \cdot 100\%`,
      showSp: false,
    },
    {
      topic: "Prąd elektryczny",
      front: "Opór zastępczy połączenia szeregowego",
      ckeRef: ["Prąd elektryczny", "Opór zastępczy połączenia szeregowego"],
    },
    {
      topic: "Prąd elektryczny",
      front: "Opór zastępczy połączenia równoległego",
      back: String.raw`\dfrac{1}{R_z} = \sum_{i=1}^{n} \dfrac{1}{R_i}`,
    },
    {
      topic: "Prąd elektryczny",
      front: "Uproszczony model transformatora",
      ckeRef: ["Magnetyzm", "Uproszczony model transformatora"],
      showSp: false,
    },

    {
      topic: "Magnetyzm",
      front: "Siła elektrodynamiczna na odcinku przewodnika",
      ckeRef: ["Magnetyzm", "Siła elektrodynamiczna na odcinku przewodnika"],
    },

    {
      topic: "Optyka geometryczna",
      front: "Prędkość światła w próżni (wartość przybliżona)",
      back: String.raw`c \approx 3{,}00 \times 10^8\ \mathrm{m/s}`,
      showSp: false,
    },
    {
      topic: "Optyka geometryczna",
      front: "Równanie soczewki i zwierciadła",
      ckeRef: ["Optyka geometryczna", "Równanie soczewki i zwierciadła"],
      showSp: false,
    },
    {
      topic: "Optyka geometryczna",
      front: "Współczynnik załamania światła",
      back: String.raw`n = \dfrac{v_1}{v_2}`,
      showSp: false,
    },
    {
      topic: "Optyka geometryczna",
      front: "Prawo Snelliusa (załamanie na granicy ośrodków)",
      ckeRef: ["Drgania, fale mechaniczne i świetlne", "Prawo Snelliusa (załamanie na granicy ośrodków)"],
    },
    {
      topic: "Optyka geometryczna",
      front: "Zdolność skupiająca soczewki",
      back: String.raw`Z = \dfrac{1}{f}\quad (f\ \text{w metrach})`,
      showSp: false,
    },
  ];
})();
