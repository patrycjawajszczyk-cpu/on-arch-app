import { useState, useEffect, useRef } from 'react';
import './App.css';
import { supabase } from './supabase';
import { Home, Calendar, Bell, MessageCircle, User, Star } from 'lucide-react';

type Ogloszenie = {
  id: string;
  typ: string;
  tytul: string;
  tresc: string;
  szczegoly: string;
  nowe: boolean;
  data_utworzenia: string;
};

type Zjazd = {
  id: number;
  nr: number;
  daty: string;
  sala: string;
  adres: string;
  tematy: string;
  status: string;
  data_zjazdu: string;
  grupa_id: number;
};

type Kursant = {
  imie: string;
  nazwisko: string;
  grupa_id: number;
  rola: string;
  avatar_url: string | null;
  grupy: { nazwa: string; miasto: string; edycja: string } | null;
};

type KursantAdmin = {
  id: number;
  imie: string;
  nazwisko: string;
  grupa_id: number;
  user_id: string;
};

type Grupa = {
  id: number;
  nazwa: string;
  miasto: string;
  edycja: string;
};

type User = {
  id: string;
  email: string;
};

type Wiadomosc = {
  id: number;
  grupa_id: number;
  user_id: string;
  imie: string;
  tekst: string;
  created_at: string;
};

type OdpowiedziAnkiety = {
  zadowolenie: number;
  wiedza_wzrosla: string;
  zajecia_teoretyczne: number;
  zajecia_rysunek: number;
  zajecia_programy: number;
  zakres_tematyczny: number;
  org_czas: number;
  org_miejsce: number;
  org_baza: number;
  org_materialy: number;
  org_kadra: number;
  org_dostosowanie: number;
  stopien_oczekiwan: number;
  ocena_ogolna: number;
  przydatne_informacje: string;
  uzasadnienie_zle: string;
  inne_uwagi: string;
  nps: string;
  plec: string;
  wyksztalcenie: string;
  wiek: string;
};

function GwiazdkiOcena({ wartosc, onChange }: { wartosc: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px', margin: '6px 0' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            fontSize: '28px', color: (hover || wartosc) >= i ? '#A05C5C' : '#ddd',
            transition: 'color 0.15s'
          }}
        >★</button>
      ))}
    </div>
  );
}

function EkranAnkieta({ kursant, zjazdy, user }: { kursant: Kursant | null; zjazdy: Zjazd[]; user: User }) {
  const [wypelniona, setWypelniona] = useState<boolean | null>(null);
  const [wysylanie, setWysylanie] = useState(false);
  const [sukces, setSukces] = useState(false);
  const [krok, setKrok] = useState(1);
  const [odpowiedzi, setOdpowiedzi] = useState<OdpowiedziAnkiety>({
    zadowolenie: 0, wiedza_wzrosla: '',
    zajecia_teoretyczne: 0, zajecia_rysunek: 0, zajecia_programy: 0,
    zakres_tematyczny: 0, org_czas: 0, org_miejsce: 0,
    org_baza: 0, org_materialy: 0, org_kadra: 0, org_dostosowanie: 0,
    stopien_oczekiwan: 0, ocena_ogolna: 0,
    przydatne_informacje: '', uzasadnienie_zle: '', inne_uwagi: '',
    nps: '', plec: '', wyksztalcenie: '', wiek: '',
  });

  // Sprawdź czy któreś pytanie organizacyjne ma niską ocenę (1 lub 2)
  const pokazUzasadnienie = [
    odpowiedzi.org_czas, odpowiedzi.org_miejsce, odpowiedzi.org_baza,
    odpowiedzi.org_materialy, odpowiedzi.org_kadra, odpowiedzi.org_dostosowanie,
  ].some(v => v > 0 && v <= 2);

  // Sprawdź czy ostatni zjazd grupy już minął
  const ostatniZjazd = zjazdy.length > 0 ? zjazdy[zjazdy.length - 1] : null;
  const kursZakonczony = ostatniZjazd?.status === 'zakonczony';

  useEffect(() => {
    if (!user || !kursant?.grupa_id) return;
    supabase.from('ankiety')
      .select('id')
      .eq('grupa_id', kursant.grupa_id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setWypelniona(!!data));
  }, [user, kursant]);

  function ustaw(pole: keyof OdpowiedziAnkiety, wartosc: number | string) {
    setOdpowiedzi(prev => ({ ...prev, [pole]: wartosc }));
  }

  async function wyslij() {
    setWysylanie(true);
    const { error } = await supabase.from('ankiety').insert([{
      ...odpowiedzi,
      grupa_id: kursant?.grupa_id,
      user_id: user.id,
    }]);
    if (!error) setSukces(true);
    setWysylanie(false);
  }

  if (!kursZakonczony) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', marginBottom: '12px' }}>Ankieta niedostępna</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
          Ankieta oceniająca kurs zostanie odblokowana po zakończeniu ostatniego zjazdu Twojej grupy.
        </p>
        {ostatniZjazd && (
          <div style={{ marginTop: '20px', background: 'var(--bg-card)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ostatni zjazd:</p>
            <p style={{ fontWeight: '600', color: 'var(--brand)', marginTop: '4px' }}>Zjazd {ostatniZjazd.nr} — {ostatniZjazd.daty}</p>
          </div>
        )}
      </div>
    );
  }

  if (wypelniona === null) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Ładowanie...</div>;

  if (wypelniona || sukces) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', marginBottom: '12px' }}>Dziękujemy!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
          Twoja opinia została zapisana. Dziękujemy za udział w kursie i za poświęcony czas.
        </p>
        <div style={{ marginTop: '24px', background: 'var(--bg-card)', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--brand)', fontWeight: '600' }}>On-Arch Barbara Szczęsna-Dyńska</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>biuro@on-arch.pl | 883 659 069</p>
        </div>
      </div>
    );
  }

  const sekcjaTytul = (t: string) => (
    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--brand)', margin: '20px 0 8px' }}>{t}</h3>
  );

  const pytanieGwiazdki = (label: string, pole: keyof OdpowiedziAnkiety) => (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '4px' }}>{label}</p>
      <GwiazdkiOcena wartosc={odpowiedzi[pole] as number} onChange={v => ustaw(pole, v)} />
    </div>
  );

  const select = (label: string, pole: keyof OdpowiedziAnkiety, opcje: string[]) => (
    <div className="login-field" style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '13px' }}>{label}</label>
      <select value={odpowiedzi[pole] as string} onChange={e => ustaw(pole, e.target.value)}>
        <option value="">-- wybierz --</option>
        {opcje.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const textarea = (label: string, pole: keyof OdpowiedziAnkiety, opcjonalne = false) => (
    <div className="login-field" style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '13px' }}>{label}{opcjonalne && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (opcjonalnie)</span>}</label>
      <textarea
        value={odpowiedzi[pole] as string}
        onChange={e => ustaw(pole, e.target.value)}
        rows={3}
        style={{ resize: 'vertical', fontSize: '13px' }}
      />
    </div>
  );

  const krokowLacznie = 4;

  return (
    <div style={{ paddingBottom: '16px' }}>
      <div style={{ background: 'var(--brand)', color: 'white', padding: '16px 20px', borderRadius: '0 0 16px 16px', marginBottom: '4px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', marginBottom: '4px' }}>Ankieta oceny kursu</h2>
        <p style={{ fontSize: '12px', opacity: 0.85 }}>Odpowiedzi są anonimowe • Krok {krok} z {krokowLacznie}</p>
        <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
          {Array.from({ length: krokowLacznie }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < krok ? 'white' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 20px' }}>
        {krok === 1 && (
          <>
            {sekcjaTytul('Ocena szkolenia')}
            {pytanieGwiazdki('1. Czy jest Pan/Pani zadowolony/a ze szkolenia?', 'zadowolenie')}

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '8px' }}>
                2. Czy czujesz, że Twoja wiedza wzrosła?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Tak', 'Trochę', 'Nie'] as const).map(opcja => (
                  <button
                    key={opcja}
                    type="button"
                    onClick={() => ustaw('wiedza_wzrosla', opcja)}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: '10px', fontSize: '13px',
                      cursor: 'pointer', fontWeight: odpowiedzi.wiedza_wzrosla === opcja ? '600' : '400',
                      background: odpowiedzi.wiedza_wzrosla === opcja ? '#A05C5C' : 'var(--bg-card)',
                      color: odpowiedzi.wiedza_wzrosla === opcja ? 'white' : 'var(--text)',
                      border: odpowiedzi.wiedza_wzrosla === opcja ? 'none' : '1px solid #ddd',
                      transition: 'all 0.15s',
                    }}
                  >{opcja}</button>
                ))}
              </div>
            </div>

            {sekcjaTytul('Prowadzenie zajęć')}
            {pytanieGwiazdki('3a. Zajęcia teoretyczne', 'zajecia_teoretyczne')}
            {pytanieGwiazdki('3b. Zajęcia praktyczne — Rysunek techniczny', 'zajecia_rysunek')}
            {pytanieGwiazdki('3c. Zajęcia praktyczne — Programy komputerowe', 'zajecia_programy')}
            {pytanieGwiazdki('4. Jak ocenia Pan/Pani zakres tematyczny szkolenia?', 'zakres_tematyczny')}
          </>
        )}

        {krok === 2 && (
          <>
            {sekcjaTytul('Organizacja szkolenia')}
            {pytanieGwiazdki('5a. Czas trwania szkolenia', 'org_czas')}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '4px' }}>
                5b. Miejsce szkolenia{' '}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>(nie dotyczy kursu online)</span>
              </p>
              <GwiazdkiOcena wartosc={odpowiedzi.org_miejsce} onChange={v => ustaw('org_miejsce', v)} />
            </div>
            {pytanieGwiazdki('5c. Baza dydaktyczna (lokal, sprzęt)', 'org_baza')}
            {pytanieGwiazdki('5d. Jakość i przydatność materiałów szkoleniowych', 'org_materialy')}
            {pytanieGwiazdki('5e. Przygotowanie zawodowe kadry dydaktycznej', 'org_kadra')}
            {pytanieGwiazdki('5f. Dostosowanie poziomu zajęć do potrzeb grupy', 'org_dostosowanie')}
            {pokazUzasadnienie && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fff8f8', borderRadius: '10px', border: '1px solid #f5c0c0' }}>
                {textarea('Proszę o uzasadnienie niskiej oceny:', 'uzasadnienie_zle', true)}
              </div>
            )}
          </>
        )}

        {krok === 3 && (
          <>
            {sekcjaTytul('Podsumowanie')}
            {pytanieGwiazdki('6. W jakim stopniu szkolenie spełniło Pana/Pani oczekiwania?', 'stopien_oczekiwan')}
            {pytanieGwiazdki('Ogólna ocena szkolenia', 'ocena_ogolna')}

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '8px' }}>
                7. Czy poleciłabyś/poleciłbyś ten kurs znajomym?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Tak', 'Może', 'Nie'] as const).map(opcja => (
                  <button
                    key={opcja}
                    type="button"
                    onClick={() => ustaw('nps', opcja)}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: '10px', fontSize: '13px',
                      cursor: 'pointer', fontWeight: odpowiedzi.nps === opcja ? '600' : '400',
                      background: odpowiedzi.nps === opcja
                        ? (opcja === 'Tak' ? '#4a7c59' : opcja === 'Nie' ? '#A05C5C' : '#7a6a3a')
                        : 'var(--bg-card)',
                      color: odpowiedzi.nps === opcja ? 'white' : 'var(--text)',
                      border: odpowiedzi.nps === opcja ? 'none' : '1px solid #ddd',
                      transition: 'all 0.15s',
                    }}
                  >{opcja}</button>
                ))}
              </div>
            </div>

            {textarea('Które z przekazywanych informacji uważa Pan/Pani za najbardziej przydatne?', 'przydatne_informacje', true)}
            {textarea('8. Inne uwagi dotyczące szkolenia', 'inne_uwagi', true)}
          </>
        )}

        {krok === 4 && (
          <>
            {sekcjaTytul('Metryczka')}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Dane służą wyłącznie do celów statystycznych i nie pozwalają na identyfikację osoby.
            </p>
            {select('Płeć', 'plec', ['Kobieta', 'Mężczyzna', 'Inne', 'Wolę nie podawać'])}
            {select('Wykształcenie', 'wyksztalcenie', ['Podstawowe', 'Zawodowe', 'Średnie', 'Wyższe licencjackie', 'Wyższe magisterskie', 'Doktorat lub wyższe'])}
            {select('Wiek', 'wiek', ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'])}
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          {krok > 1 && (
            <button
              onClick={() => setKrok(k => k - 1)}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--brand)', background: 'white', color: 'var(--brand)', fontSize: '15px', cursor: 'pointer', fontWeight: '600' }}
            >← Wstecz</button>
          )}
          {krok < krokowLacznie ? (
            <button
              onClick={() => setKrok(k => k + 1)}
              className="login-btn"
              style={{ flex: 1 }}
            >Dalej →</button>
          ) : (
            <button
              onClick={wyslij}
              className="login-btn"
              style={{ flex: 1 }}
              disabled={wysylanie}
            >{wysylanie ? 'Wysyłanie...' : 'Wyślij ankietę ✓'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function EkranZmianaHasla() {
  const [haslo, setHaslo] = useState('');
  const [haslo2, setHaslo2] = useState('');
  const [blad, setBlad] = useState('');
  const [sukces, setSukces] = useState(false);
  const [ladowanie, setLadowanie] = useState(false);

  async function zmienHaslo(e: React.FormEvent) {
    e.preventDefault();
    if (haslo !== haslo2) { setBlad('Hasla nie sa identyczne'); return; }
    if (haslo.length < 6) { setBlad('Haslo musi miec minimum 6 znakow'); return; }
    setLadowanie(true);
    setBlad('');
    const { error } = await supabase.auth.updateUser({ password: haslo });
    if (error) { setBlad('Blad zmiany hasla. Sprobuj ponownie.'); }
    else { setSukces(true); }
    setLadowanie(false);
  }

  if (sukces) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">On<span>-Arch</span></div>
          <div className="reset-success">
            <div className="reset-icon">✅</div>
            <h3>Haslo zostalo zmienione!</h3>
            <p>Mozesz teraz zalogowac sie nowym haslem.</p>
          </div>
          <button className="login-btn" style={{marginTop: '20px'}} onClick={() => window.location.href = '/'}>Przejdz do logowania</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">On<span>-Arch</span></div>
        <p className="login-sub">Ustaw nowe haslo</p>
        <form className="login-form" onSubmit={zmienHaslo}>
          <div className="login-field">
            <label>Nowe haslo</label>
            <input type="password" value={haslo} onChange={e => setHaslo(e.target.value)} placeholder="password" required />
          </div>
          <div className="login-field">
            <label>Powtorz haslo</label>
            <input type="password" value={haslo2} onChange={e => setHaslo2(e.target.value)} placeholder="password" required />
          </div>
          {blad && <div className="login-error">{blad}</div>}
          <button className="login-btn" type="submit" disabled={ladowanie}>{ladowanie ? 'Zapisywanie...' : 'Ustaw haslo'}</button>
        </form>
      </div>
    </div>
  );
}

function EkranPolitykaPrywatnosci({ onWroc }: { onWroc: () => void }) {
  return (
    <div className="login-screen" style={{overflowY:'auto', alignItems:'flex-start', padding:'24px'}}>
      <button className="btn-wroc" onClick={onWroc} style={{marginBottom:'16px'}}>← Wróć</button>
      <h2 style={{fontFamily:'Cormorant Garamond, serif', fontSize:'22px', marginBottom:'16px'}}>Polityka Prywatności</h2>
      <div style={{fontSize:'13px', lineHeight:'1.7', color:'var(--text)'}}>
        <p style={{marginBottom:'12px'}}><strong>Administrator danych osobowych:</strong><br/>On-Arch Barbara Szczęsna-Dyńska<br/>ul. Tymienieckiego 25D/53, 90-350 Łódź<br/>Email: biuro@on-arch.pl</p>
        <p style={{marginBottom:'8px'}}><strong>1. Jakie dane zbieramy?</strong></p>
        <p style={{marginBottom:'12px'}}>W ramach aplikacji On-Arch przetwarzamy następujące dane osobowe: imię i nazwisko, adres e-mail, numer telefonu, zdjęcie profilowe (opcjonalne).</p>
        <p style={{marginBottom:'8px'}}><strong>2. W jakim celu?</strong></p>
        <p style={{marginBottom:'12px'}}>Dane są przetwarzane wyłącznie w celu umożliwienia korzystania z aplikacji On-Arch — dostępu do informacji o zjazdach, ogłoszeń biura oraz komunikacji w ramach grupy kursantów.</p>
        <p style={{marginBottom:'8px'}}><strong>3. Podstawa prawna</strong></p>
        <p style={{marginBottom:'12px'}}>Przetwarzanie danych odbywa się na podstawie art. 6 ust. 1 lit. b RODO (wykonanie umowy) oraz art. 6 ust. 1 lit. a RODO (zgoda użytkownika).</p>
        <p style={{marginBottom:'8px'}}><strong>4. Jak długo przechowujemy dane?</strong></p>
        <p style={{marginBottom:'12px'}}>Dane są przechowywane przez czas trwania kursu oraz do 12 miesięcy po jego zakończeniu, chyba że wyrazisz wolę wcześniejszego usunięcia.</p>
        <p style={{marginBottom:'8px'}}><strong>5. Twoje prawa</strong></p>
        <p style={{marginBottom:'12px'}}>Masz prawo do: dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia skargi do Prezesa UODO (ul. Stawki 2, 00-193 Warszawa).</p>
        <p style={{marginBottom:'8px'}}><strong>6. Bezpieczeństwo</strong></p>
        <p style={{marginBottom:'12px'}}>Dane są przechowywane na serwerach Supabase (UE, Frankfurt) z zastosowaniem szyfrowania i zabezpieczeń zgodnych z RODO.</p>
        <p style={{marginBottom:'8px'}}><strong>7. Kontakt</strong></p>
        <p>W sprawach dotyczących danych osobowych skontaktuj się z nami: biuro@on-arch.pl lub tel. 883 659 069.</p>
      </div>
    </div>
  );
}

function EkranRegulamin({ onWroc }: { onWroc: () => void }) {
  return (
    <div className="login-screen" style={{overflowY:'auto', alignItems:'flex-start', padding:'24px'}}>
      <button className="btn-wroc" onClick={onWroc} style={{marginBottom:'16px'}}>← Wróć</button>
      <h2 style={{fontFamily:'Cormorant Garamond, serif', fontSize:'22px', marginBottom:'16px'}}>Regulamin aplikacji</h2>
      <div style={{fontSize:'13px', lineHeight:'1.7', color:'var(--text)'}}>
        <p style={{marginBottom:'12px'}}><strong>Aplikacja On-Arch</strong> — regulamin korzystania z aplikacji mobilnej dla kursantów.</p>
        <p style={{marginBottom:'8px'}}><strong>1. Postanowienia ogólne</strong></p>
        <p style={{marginBottom:'12px'}}>Aplikacja On-Arch jest przeznaczona wyłącznie dla kursantów On-Arch Barbara Szczęsna-Dyńska. Korzystanie z aplikacji jest dobrowolne i bezpłatne.</p>
        <p style={{marginBottom:'8px'}}><strong>2. Konto użytkownika</strong></p>
        <p style={{marginBottom:'12px'}}>Dostęp do aplikacji wymaga założenia konta przez biuro On-Arch. Kursant zobowiązuje się do nieudostępniania danych logowania osobom trzecim.</p>
        <p style={{marginBottom:'8px'}}><strong>3. Czat grupowy</strong></p>
        <p style={{marginBottom:'12px'}}>Kursanci zobowiązują się do kulturalnego i zgodnego z prawem korzystania z czatu grupowego. Zabrania się publikowania treści obraźliwych, niezgodnych z prawem lub naruszających prawa osób trzecich. Biuro On-Arch zastrzega sobie prawo do usuwania nieodpowiednich treści.</p>
        <p style={{marginBottom:'8px'}}><strong>4. Zdjęcie profilowe</strong></p>
        <p style={{marginBottom:'12px'}}>Kursant wgrywając zdjęcie profilowe wyraża zgodę na jego przechowywanie i wyświetlanie innym kursantom w ramach grupy.</p>
        <p style={{marginBottom:'8px'}}><strong>5. Odpowiedzialność</strong></p>
        <p style={{marginBottom:'12px'}}>On-Arch dokłada starań, aby informacje w aplikacji były aktualne i rzetelne. Nie ponosimy odpowiedzialności za skutki działań podjętych na podstawie błędnie wprowadzonych danych.</p>
        <p style={{marginBottom:'8px'}}><strong>6. Zmiany regulaminu</strong></p>
        <p style={{marginBottom:'12px'}}>On-Arch zastrzega sobie prawo do zmiany regulaminu. O zmianach kursanci zostaną poinformowani przez ogłoszenie w aplikacji.</p>
        <p style={{marginBottom:'8px'}}><strong>7. Kontakt</strong></p>
        <p>On-Arch Barbara Szczęsna-Dyńska<br/>ul. Tymienieckiego 25D/53, 90-350 Łódź<br/>biuro@on-arch.pl | 883 659 069</p>
      </div>
    </div>
  );
}

function EkranLogowania({ onZalogowano }: { onZalogowano: () => void }) {
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [blad, setBlad] = useState('');
  const [ladowanie, setLadowanie] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetWyslany, setResetWyslany] = useState(false);
  const [zgodaRodo, setZgodaRodo] = useState(false);
  const [pokazPolityka, setPokazPolityka] = useState(false);
  const [pokazRegulamin, setPokazRegulamin] = useState(false);

  async function zaloguj(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true);
    setBlad('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: haslo });
    if (error) { setBlad('Nieprawidlowy email lub haslo'); }
    else { onZalogowano(); }
    setLadowanie(false);
  }

  async function resetHasla(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true);
    setBlad('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://on-arch-akademia.vercel.app' });
    if (error) { setBlad('Blad wysylania emaila. Sprawdz adres.'); }
    else { setResetWyslany(true); }
    setLadowanie(false);
  }

  if (pokazPolityka) return <EkranPolitykaPrywatnosci onWroc={() => setPokazPolityka(false)} />;
  if (pokazRegulamin) return <EkranRegulamin onWroc={() => setPokazRegulamin(false)} />;

  if (resetWyslany) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">On<span>-Arch</span></div>
          <div className="reset-success">
            <div className="reset-icon">✉️</div>
            <h3>Sprawdz skrzynke</h3>
            <p>Wyslalismy link na adres <strong>{email}</strong></p>
          </div>
          <button className="login-btn" style={{marginTop: '20px'}} onClick={() => { setResetMode(false); setResetWyslany(false); }}>Wroce do logowania</button>
        </div>
      </div>
    );
  }

  if (resetMode) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">On<span>-Arch</span></div>
          <p className="login-sub">Resetowanie hasla</p>
          <form className="login-form" onSubmit={resetHasla}>
            <div className="login-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" required />
            </div>
            {blad && <div className="login-error">{blad}</div>}
            <button className="login-btn" type="submit" disabled={ladowanie}>{ladowanie ? 'Wysylanie...' : 'Wyslij link resetujacy'}</button>
          </form>
          <button className="btn-link" onClick={() => setResetMode(false)}>Wroce do logowania</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">On<span>-Arch</span></div>
        <p className="login-sub">Panel kursanta</p>
        <form className="login-form" onSubmit={zaloguj}>
          <div className="login-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" required />
          </div>
          <div className="login-field">
            <label>Haslo</label>
            <input type="password" value={haslo} onChange={e => setHaslo(e.target.value)} placeholder="password" required />
          </div>
          {blad && <div className="login-error">{blad}</div>}
          <div style={{display:'flex', alignItems:'flex-start', gap:'8px', margin:'12px 0'}}>
            <input type="checkbox" id="zgoda" checked={zgodaRodo} onChange={e => setZgodaRodo(e.target.checked)} style={{marginTop:'3px', accentColor:'var(--brand)'}} />
            <label htmlFor="zgoda" style={{fontSize:'12px', color:'var(--text-muted)', lineHeight:'1.6'}}>
              Akceptuję <button type="button" className="btn-link" style={{display:'inline', fontSize:'12px'}} onClick={() => setPokazRegulamin(true)}>Regulamin</button> oraz <button type="button" className="btn-link" style={{display:'inline', fontSize:'12px'}} onClick={() => setPokazPolityka(true)}>Politykę Prywatności</button>
            </label>
          </div>
          <button className="login-btn" type="submit" disabled={ladowanie || !zgodaRodo}>{ladowanie ? 'Logowanie...' : 'Zaloguj sie'}</button>
        </form>
        <button className="btn-link" onClick={() => setResetMode(true)}>Nie pamietasz hasla?</button>
        <p className="login-kontakt">Problemy z logowaniem? Zadzwon do biura:<br/><strong>883 659 069</strong></p>
      </div>
    </div>
  );
}

function EkranCzat({ user, kursant }: { user: User; kursant: Kursant | null }) {
  const [wiadomosci, setWiadomosci] = useState<Wiadomosc[]>([]);
  const [nowa, setNowa] = useState('');
  const [wysylanie, setWysylanie] = useState(false);
  const doRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kursant?.grupa_id) return;
    supabase.from('wiadomosci').select('*').eq('grupa_id', kursant.grupa_id).order('created_at', { ascending: true }).then(({ data }) => {
      setWiadomosci(data || []);
      setTimeout(() => doRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    const channel = supabase.channel('czat-' + kursant.grupa_id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wiadomosci', filter: `grupa_id=eq.${kursant.grupa_id}` }, (payload) => {
        setWiadomosci(prev => [...prev, payload.new as Wiadomosc]);
        setTimeout(() => doRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [kursant?.grupa_id]);

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    if (!nowa.trim() || !kursant) return;
    setWysylanie(true);
    await supabase.from('wiadomosci').insert([{
      grupa_id: kursant.grupa_id,
      user_id: user.id,
      imie: kursant.imie,
      tekst: nowa.trim(),
    }]);
    setNowa('');
    setWysylanie(false);
  }

  if (!kursant?.grupa_id) {
    return <div style={{padding:'24px', textAlign:'center', color:'var(--text-muted)'}}>Nie jestes przypisany do zadnej grupy.</div>;
  }

  return (
    <div className="czat-container">
      <h2 className="page-title">Czat grupy</h2>
      <div className="czat-nazwa">{kursant.grupy?.nazwa || 'Twoja grupa'}</div>
      <div className="czat-wiadomosci">
        {wiadomosci.length === 0 && <div className="czat-puste">Brak wiadomosci. Napisz pierwsza!</div>}
        {wiadomosci.map(w => (
          <div key={w.id} className={`czat-msg ${w.user_id === user.id ? 'moja' : 'obca'}`}>
            {w.user_id !== user.id && <div className="czat-imie">{w.imie}</div>}
            <div className="czat-buble">{w.tekst}</div>
            <div className="czat-czas">{new Date(w.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ))}
        <div ref={doRef} />
      </div>
      <form className="czat-form" onSubmit={wyslij}>
        <input className="czat-input" type="text" value={nowa} onChange={e => setNowa(e.target.value)} placeholder="Napisz wiadomosc..." disabled={wysylanie} maxLength={500} />
        <button className="czat-btn" type="submit" disabled={wysylanie || !nowa.trim()}>➤</button>
      </form>
    </div>
  );
}

function PanelBiura({ onWyloguj }: { onWyloguj: () => void }) {
  const [aktywnaZakladka, setAktywnaZakladka] = useState('ogloszenia');
  const [grupy, setGrupy] = useState<Grupa[]>([]);
  const [kursanci, setKursanci] = useState<KursantAdmin[]>([]);
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
  const [ankiety, setAnkiety] = useState<OdpowiedziAnkiety[]>([]);
  const [edytowane, setEdytowane] = useState<Ogloszenie | null>(null);
  const [edytowanyZjazd, setEdytowanyZjazd] = useState<Zjazd | null>(null);
  const [noweOgl, setNoweOgl] = useState({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true });
  const [nowyZjazd, setNowyZjazd] = useState({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '' });
  const [nowyKursant, setNowyKursant] = useState({ imie: '', nazwisko: '', email: '', grupa_id: '' });
  const [nowaGrupa, setNowaGrupa] = useState({ nazwa: '', miasto: '', edycja: '' });
  const [komunikat, setKomunikat] = useState('');
  const [importStatus, setImportStatus] = useState<{imie: string; nazwisko: string; email: string; status: string}[]>([]);
  const [importowanie, setImportowanie] = useState(false);
  const [wybranaGrupaAnkiety, setWybranaGrupaAnkiety] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pobierzGrupy();
    pobierzOgloszenia();
    pobierzZjazdy();
    supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id').then(({ data }) => setKursanci((data || []) as unknown as KursantAdmin[]));
    supabase.from('ankiety').select('*').order('created_at', { ascending: false }).then(({ data }) => setAnkiety((data || []) as unknown as OdpowiedziAnkiety[]));
  }, []);

  async function pobierzGrupy() {
    const { data } = await supabase.from('grupy').select('*');
    setGrupy(data || []);
  }

  async function pobierzOgloszenia() {
    const { data } = await supabase.from('ogloszenia').select('*').order('data_utworzenia', { ascending: false });
    setOgloszenia(data || []);
  }

  async function pobierzZjazdy() {
    const { data } = await supabase.from('zjazdy').select('*').order('data_zjazdu', { ascending: true });
    setZjazdy(data || []);
  }

  async function dodajOgloszenie(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('ogloszenia').insert([{ ...noweOgl, data_utworzenia: new Date().toISOString() }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Ogloszenie dodane!'); setNoweOgl({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true }); pobierzOgloszenia(); }
  }

  async function zapiszEdycje(e: React.FormEvent) {
    e.preventDefault();
    if (!edytowane) return;
    const { error } = await supabase.from('ogloszenia').update({ typ: edytowane.typ, tytul: edytowane.tytul, tresc: edytowane.tresc, szczegoly: edytowane.szczegoly }).eq('id', edytowane.id);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Ogloszenie zaktualizowane!'); setEdytowane(null); pobierzOgloszenia(); }
  }

  async function usunOgloszenie(id: string) {
    if (!window.confirm('Czy na pewno chcesz usunac to ogloszenie?')) return;
    const { error } = await supabase.from('ogloszenia').delete().eq('id', id);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Ogloszenie usuniete!'); pobierzOgloszenia(); }
  }

  async function dodajZjazd(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('zjazdy').insert([{ ...nowyZjazd, nr: parseInt(nowyZjazd.nr), grupa_id: parseInt(nowyZjazd.grupa_id) }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Zjazd dodany!'); setNowyZjazd({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '' }); pobierzZjazdy(); }
  }

  async function zapiszEdycjeZjazdu(e: React.FormEvent) {
    e.preventDefault();
    if (!edytowanyZjazd) return;

    const poprzedniStatus = zjazdy.find(z => z.id === edytowanyZjazd.id)?.status;
    const nowyStatus = edytowanyZjazd.status;
    const grupaId = edytowanyZjazd.grupa_id;

    const { error } = await supabase.from('zjazdy').update({
      nr: edytowanyZjazd.nr, daty: edytowanyZjazd.daty, sala: edytowanyZjazd.sala,
      adres: edytowanyZjazd.adres, tematy: edytowanyZjazd.tematy,
      status: nowyStatus, data_zjazdu: edytowanyZjazd.data_zjazdu,
      grupa_id: grupaId,
    }).eq('id', edytowanyZjazd.id);

    if (error) { setKomunikat('Blad: ' + error.message); return; }

    // Jeśli właśnie oznaczono zjazd jako zakończony — sprawdź czy to ostatni
    if (nowyStatus === 'zakonczony' && poprzedniStatus !== 'zakonczony') {
      const { data: wszystkieZjazdy } = await supabase
        .from('zjazdy').select('*').eq('grupa_id', grupaId).order('data_zjazdu', { ascending: true });

      const jeszczeNadchodzace = (wszystkieZjazdy || []).filter(
        z => z.id !== edytowanyZjazd.id && z.status === 'nadchodzacy'
      );

      if (jeszczeNadchodzace.length === 0) {
        // Ostatni zjazd! Dodaj ogłoszenie-powiadomienie w aplikacji
        const nazwaGrupy = grupy.find(g => g.id === grupaId)?.nazwa || 'Twoja grupa';
        await supabase.from('ogloszenia').insert([{
          typ: 'Informacja',
          tytul: 'Wypełnij ankietę oceny kursu ⭐',
          tresc: 'Twój kurs dobiegł końca. Prosimy o wypełnienie krótkiej ankiety — to tylko kilka minut!',
          szczegoly: `Dziękujemy za udział w kursie ${nazwaGrupy}!\n\nTwoja opinia jest dla nas bardzo ważna i pomoże nam udoskonalić kolejne edycje kursu.\n\nProsimy o wypełnienie krótkiej ankiety oceniającej szkolenie. Znajdziesz ją w aplikacji, w zakładce ⭐ Ankieta w dolnym menu.\n\nZ góry dziękujemy!\nZespół On-Arch`,
          nowe: true,
          data_utworzenia: new Date().toISOString(),
        }]);
        setKomunikat(`Zjazd zakończony! Kursanci zobaczą powiadomienie o ankiecie w aplikacji.`);
      } else {
        setKomunikat('Zjazd zaktualizowany!');
      }
    } else {
      setKomunikat('Zjazd zaktualizowany!');
    }

    setEdytowanyZjazd(null);
    pobierzZjazdy();
  }

  async function usunZjazd(id: number) {
    if (!window.confirm('Czy na pewno chcesz usunac ten zjazd?')) return;
    const { error } = await supabase.from('zjazdy').delete().eq('id', id);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Zjazd usuniety!'); pobierzZjazdy(); }
  }

  async function dodajKursanta(e: React.FormEvent) {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: nowyKursant.email, password: Math.random().toString(36).slice(-10) });
    if (authError) { setKomunikat('Blad tworzenia konta: ' + authError.message); return; }
    const { error } = await supabase.from('kursanci').insert([{ imie: nowyKursant.imie, nazwisko: nowyKursant.nazwisko, grupa_id: parseInt(nowyKursant.grupa_id), user_id: authData.user!.id, rola: 'kursant' }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else {
      setKomunikat('Kursant dodany!');
      setNowyKursant({ imie: '', nazwisko: '', email: '', grupa_id: '' });
      const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id');
      setKursanci((data || []) as unknown as KursantAdmin[]);
    }
  }

  async function dodajGrupe(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('grupy').insert([{ ...nowaGrupa }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Grupa dodana!'); setNowaGrupa({ nazwa: '', miasto: '', edycja: '' }); pobierzGrupy(); }
  }

  async function importujCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportowanie(true);
    setImportStatus([]);
    const text = await file.text();
    const rows = text.trim().split('\n').slice(1);
    const wyniki: {imie: string; nazwisko: string; email: string; status: string}[] = [];
    for (const row of rows) {
      const [imie, nazwisko, email, grupa_id] = row.split(',').map(s => s.trim());
      if (!imie || !nazwisko || !email || !grupa_id) continue;
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: Math.random().toString(36).slice(-10) });
      if (authError) { wyniki.push({ imie, nazwisko, email, status: 'Blad: ' + authError.message }); continue; }
      const { error } = await supabase.from('kursanci').insert([{ imie, nazwisko, grupa_id: parseInt(grupa_id), user_id: authData.user!.id, rola: 'kursant' }]);
      wyniki.push({ imie, nazwisko, email, status: error ? 'Blad: ' + error.message : 'Dodano!' });
      setImportStatus([...wyniki]);
      await new Promise(r => setTimeout(r, 1000));
    }
    setImportowanie(false);
    const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id');
    setKursanci((data || []) as unknown as KursantAdmin[]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function eksportujAnkietyCSV() {
    const filtred = wybranaGrupaAnkiety
      ? ankiety.filter((a: any) => a.grupa_id === parseInt(wybranaGrupaAnkiety))
      : ankiety;
    const naglowki = ['data', 'grupa_id', 'zadowolenie', 'wiedza_wzrosla', 'zajecia_teoretyczne', 'zajecia_rysunek', 'zajecia_programy', 'zakres_tematyczny', 'org_czas', 'org_miejsce', 'org_baza', 'org_materialy', 'org_kadra', 'org_dostosowanie', 'stopien_oczekiwan', 'ocena_ogolna', 'nps', 'przydatne_informacje', 'uzasadnienie_zle', 'inne_uwagi', 'plec', 'wyksztalcenie', 'wiek'];
    const wiersze = filtred.map((a: any) => naglowki.map(k => `"${(a[k] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [naglowki.join(','), ...wiersze].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ankiety_onarch.csv'; a.click();
  }

  function srednia(pole: keyof OdpowiedziAnkiety, lista: OdpowiedziAnkiety[]) {
    const vals = lista.map(a => a[pole] as number).filter(v => v > 0);
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }

  const ankietyFiltrowane = wybranaGrupaAnkiety
    ? ankiety.filter((a: any) => a.grupa_id === parseInt(wybranaGrupaAnkiety))
    : ankiety;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">On<span>-Arch</span> <span style={{fontSize:'11px', opacity:0.7}}>Biuro</span></div>
        <button onClick={onWyloguj} style={{background:'none', border:'none', color:'var(--brand)', fontSize:'13px', cursor:'pointer'}}>Wyloguj</button>
      </header>
      <main className="main">
        {komunikat && <div className="login-error" style={{background:'#e8f5e9', color:'#2e7d32', marginBottom:'12px'}}>{komunikat}</div>}

        {aktywnaZakladka === 'ogloszenia' && (
          <>
            {edytowane ? (
              <>
                <h2 className="page-title">Edytuj ogloszenie</h2>
                <form className="admin-form" onSubmit={zapiszEdycje}>
                  <div className="login-field"><label>Typ</label>
                    <select value={edytowane.typ} onChange={e => setEdytowane({...edytowane, typ: e.target.value})}>
                      <option>Informacja</option><option>Pilne</option><option>Zmiana</option>
                    </select>
                  </div>
                  <div className="login-field"><label>Tytul</label><input type="text" value={edytowane.tytul} onChange={e => setEdytowane({...edytowane, tytul: e.target.value})} required /></div>
                  <div className="login-field"><label>Krotki opis</label><input type="text" value={edytowane.tresc} onChange={e => setEdytowane({...edytowane, tresc: e.target.value})} required /></div>
                  <div className="login-field"><label>Pelna tresc</label><textarea value={edytowane.szczegoly} onChange={e => setEdytowane({...edytowane, szczegoly: e.target.value})} rows={4} /></div>
                  <button className="login-btn" type="submit">Zapisz zmiany</button>
                  <button className="btn-link" onClick={() => setEdytowane(null)}>Anuluj</button>
                </form>
              </>
            ) : (
              <>
                <h2 className="page-title">Nowe ogloszenie</h2>
                <form className="admin-form" onSubmit={dodajOgloszenie}>
                  <div className="login-field"><label>Typ</label>
                    <select value={noweOgl.typ} onChange={e => setNoweOgl({...noweOgl, typ: e.target.value})}>
                      <option>Informacja</option><option>Pilne</option><option>Zmiana</option>
                    </select>
                  </div>
                  <div className="login-field"><label>Tytul</label><input type="text" value={noweOgl.tytul} onChange={e => setNoweOgl({...noweOgl, tytul: e.target.value})} required /></div>
                  <div className="login-field"><label>Krotki opis</label><input type="text" value={noweOgl.tresc} onChange={e => setNoweOgl({...noweOgl, tresc: e.target.value})} required /></div>
                  <div className="login-field"><label>Pelna tresc</label><textarea value={noweOgl.szczegoly} onChange={e => setNoweOgl({...noweOgl, szczegoly: e.target.value})} rows={4} /></div>
                  <button className="login-btn" type="submit">Dodaj ogloszenie</button>
                </form>
                <h2 className="page-title" style={{marginTop:'24px'}}>Lista ogloszen</h2>
                {ogloszenia.map(o => (
                  <div key={o.id} className="profil-card" style={{marginBottom:'8px'}}>
                    <div className="profil-row"><span className="profil-lbl">Tytul</span><span className="profil-val">{o.tytul}</span></div>
                    <div className="profil-row"><span className="profil-lbl">Typ</span><span className="profil-val">{o.typ}</span></div>
                    <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                      <button className="login-btn" style={{flex:1, padding:'8px'}} onClick={() => { setEdytowane(o); setKomunikat(''); }}>Edytuj</button>
                      <button className="btn-wyloguj" style={{flex:1, padding:'8px'}} onClick={() => usunOgloszenie(o.id)}>Usun</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {aktywnaZakladka === 'zjazdy' && (
          <>
            {edytowanyZjazd ? (
              <>
                <h2 className="page-title">Edytuj zjazd</h2>
                <form className="admin-form" onSubmit={zapiszEdycjeZjazdu}>
                  <div className="login-field"><label>Grupa</label>
                    <select value={edytowanyZjazd.grupa_id} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, grupa_id: parseInt(e.target.value)})}>
                      {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                  </div>
                  <div className="login-field"><label>Numer zjazdu</label><input type="number" value={edytowanyZjazd.nr} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, nr: parseInt(e.target.value)})} required /></div>
                  <div className="login-field"><label>Daty</label><input type="text" value={edytowanyZjazd.daty} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, daty: e.target.value})} required /></div>
                  <div className="login-field"><label>Data zjazdu</label><input type="date" value={edytowanyZjazd.data_zjazdu} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, data_zjazdu: e.target.value})} required /></div>
                  <div className="login-field"><label>Sala</label><input type="text" value={edytowanyZjazd.sala} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, sala: e.target.value})} required /></div>
                  <div className="login-field"><label>Adres</label><input type="text" value={edytowanyZjazd.adres} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, adres: e.target.value})} required /></div>
                  <div className="login-field"><label>Tematy</label><input type="text" value={edytowanyZjazd.tematy} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, tematy: e.target.value})} required /></div>
                  <div className="login-field"><label>Status</label>
                    <select value={edytowanyZjazd.status} onChange={e => setEdytowanyZjazd({...edytowanyZjazd, status: e.target.value})}>
                      <option value="nadchodzacy">Nadchodzacy</option>
                      <option value="zakonczony">Zakonczony</option>
                    </select>
                  </div>
                  <button className="login-btn" type="submit">Zapisz zmiany</button>
                  <button className="btn-link" onClick={() => setEdytowanyZjazd(null)}>Anuluj</button>
                </form>
              </>
            ) : (
              <>
                <h2 className="page-title">Nowy zjazd</h2>
                <form className="admin-form" onSubmit={dodajZjazd}>
                  <div className="login-field"><label>Grupa</label>
                    <select value={nowyZjazd.grupa_id} onChange={e => setNowyZjazd({...nowyZjazd, grupa_id: e.target.value})} required>
                      <option value="">Wybierz grupe</option>
                      {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                  </div>
                  <div className="login-field"><label>Numer zjazdu</label><input type="number" value={nowyZjazd.nr} onChange={e => setNowyZjazd({...nowyZjazd, nr: e.target.value})} required /></div>
                  <div className="login-field"><label>Daty (np. 22-23 marca 2025)</label><input type="text" value={nowyZjazd.daty} onChange={e => setNowyZjazd({...nowyZjazd, daty: e.target.value})} required /></div>
                  <div className="login-field"><label>Data zjazdu</label><input type="date" value={nowyZjazd.data_zjazdu} onChange={e => setNowyZjazd({...nowyZjazd, data_zjazdu: e.target.value})} required /></div>
                  <div className="login-field"><label>Sala</label><input type="text" value={nowyZjazd.sala} onChange={e => setNowyZjazd({...nowyZjazd, sala: e.target.value})} required /></div>
                  <div className="login-field"><label>Adres</label><input type="text" value={nowyZjazd.adres} onChange={e => setNowyZjazd({...nowyZjazd, adres: e.target.value})} required /></div>
                  <div className="login-field"><label>Tematy</label><input type="text" value={nowyZjazd.tematy} onChange={e => setNowyZjazd({...nowyZjazd, tematy: e.target.value})} required /></div>
                  <div className="login-field"><label>Status</label>
                    <select value={nowyZjazd.status} onChange={e => setNowyZjazd({...nowyZjazd, status: e.target.value})}>
                      <option value="nadchodzacy">Nadchodzacy</option>
                      <option value="zakonczony">Zakonczony</option>
                    </select>
                  </div>
                  <button className="login-btn" type="submit">Dodaj zjazd</button>
                </form>
                <h2 className="page-title" style={{marginTop:'24px'}}>Lista zjazdow</h2>
                {zjazdy.map(z => (
                  <div key={z.id} className="profil-card" style={{marginBottom:'8px'}}>
                    <div className="profil-row"><span className="profil-lbl">Zjazd {z.nr}</span><span className="profil-val">{z.daty}</span></div>
                    <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{grupy.find(g => g.id === z.grupa_id)?.nazwa || '-'}</span></div>
                    <div className="profil-row"><span className="profil-lbl">Status</span><span className="profil-val">{z.status === 'nadchodzacy' ? 'Nadchodzacy' : 'Zakonczony'}</span></div>
                    <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                      <button className="login-btn" style={{flex:1, padding:'8px'}} onClick={() => { setEdytowanyZjazd(z); setKomunikat(''); }}>Edytuj</button>
                      <button className="btn-wyloguj" style={{flex:1, padding:'8px'}} onClick={() => usunZjazd(z.id)}>Usun</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {aktywnaZakladka === 'kursanci' && (
          <>
            <h2 className="page-title">Nowy kursant</h2>
            <form className="admin-form" onSubmit={dodajKursanta}>
              <div className="login-field"><label>Imie</label><input type="text" value={nowyKursant.imie} onChange={e => setNowyKursant({...nowyKursant, imie: e.target.value})} required /></div>
              <div className="login-field"><label>Nazwisko</label><input type="text" value={nowyKursant.nazwisko} onChange={e => setNowyKursant({...nowyKursant, nazwisko: e.target.value})} required /></div>
              <div className="login-field"><label>Email</label><input type="email" value={nowyKursant.email} onChange={e => setNowyKursant({...nowyKursant, email: e.target.value})} required /></div>
              <div className="login-field"><label>Grupa</label>
                <select value={nowyKursant.grupa_id} onChange={e => setNowyKursant({...nowyKursant, grupa_id: e.target.value})} required>
                  <option value="">Wybierz grupe</option>
                  {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                </select>
              </div>
              <button className="login-btn" type="submit">Dodaj kursanta</button>
            </form>
            <h2 className="page-title" style={{marginTop:'24px'}}>Lista kursantow</h2>
            {kursanci.map(k => (
              <div key={k.id} className="profil-card" style={{marginBottom:'8px'}}>
                <div className="profil-row"><span className="profil-lbl">Imie i nazwisko</span><span className="profil-val">{k.imie} {k.nazwisko}</span></div>
                <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{grupy.find(g => g.id === k.grupa_id)?.nazwa || '-'}</span></div>
              </div>
            ))}
          </>
        )}

        {aktywnaZakladka === 'grupy' && (
          <>
            <h2 className="page-title">Nowa grupa</h2>
            <form className="admin-form" onSubmit={dodajGrupe}>
              <div className="login-field"><label>Nazwa grupy</label><input type="text" value={nowaGrupa.nazwa} onChange={e => setNowaGrupa({...nowaGrupa, nazwa: e.target.value})} placeholder="np. Grupa III Warszawa 2025/2026" required /></div>
              <div className="login-field"><label>Miasto</label><input type="text" value={nowaGrupa.miasto} onChange={e => setNowaGrupa({...nowaGrupa, miasto: e.target.value})} placeholder="np. Warszawa" required /></div>
              <div className="login-field"><label>Edycja</label><input type="text" value={nowaGrupa.edycja} onChange={e => setNowaGrupa({...nowaGrupa, edycja: e.target.value})} placeholder="np. 2025/2026" required /></div>
              <button className="login-btn" type="submit">Dodaj grupe</button>
            </form>
            <h2 className="page-title" style={{marginTop:'24px'}}>Lista grup</h2>
            {grupy.map(g => (
              <div key={g.id} className="profil-card" style={{marginBottom:'8px'}}>
                <div className="profil-row"><span className="profil-lbl">ID do CSV</span><span className="profil-val" style={{fontWeight:'700', color:'var(--brand)'}}>{g.id}</span></div>
                <div className="profil-row"><span className="profil-lbl">Nazwa</span><span className="profil-val">{g.nazwa}</span></div>
                <div className="profil-row"><span className="profil-lbl">Miasto</span><span className="profil-val">{g.miasto}</span></div>
                <div className="profil-row"><span className="profil-lbl">Edycja</span><span className="profil-val">{g.edycja}</span></div>
              </div>
            ))}
          </>
        )}

        {aktywnaZakladka === 'import' && (
          <>
            <h2 className="page-title">Import kursantow z CSV</h2>
            <div className="profil-card" style={{marginBottom:'16px'}}>
              <p style={{fontSize:'13px', color:'var(--text-muted)', marginBottom:'8px'}}>Format pliku CSV (pierwsza linia to naglowek):</p>
              <code style={{fontSize:'12px', background:'#f5f5f5', padding:'8px', borderRadius:'6px', display:'block', whiteSpace:'pre'}}>imie,nazwisko,email,grupa_id{'\n'}Anna,Kowalska,a.kowalska@email.pl,1{'\n'}Jan,Nowak,j.nowak@email.pl,1</code>
              <p style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'8px'}}>grupa_id znajdziesz w zakladce Grupy</p>
            </div>
            <div className="login-field">
              <label>Wybierz plik CSV</label>
              <input ref={fileRef} type="file" accept=".csv" onChange={importujCSV} disabled={importowanie} style={{padding:'8px', border:'1px solid #ddd', borderRadius:'8px', width:'100%'}} />
            </div>
            {importowanie && <div style={{textAlign:'center', padding:'12px', color:'var(--brand)'}}>Importowanie... nie zamykaj tej strony</div>}
            {importStatus.length > 0 && (
              <>
                <h2 className="page-title" style={{marginTop:'16px'}}>Wyniki importu</h2>
                {importStatus.map((s, i) => (
                  <div key={i} className="profil-card" style={{marginBottom:'6px', borderLeft: s.status === 'Dodano!' ? '3px solid #2e7d32' : '3px solid #c62828'}}>
                    <div className="profil-row"><span className="profil-lbl">{s.imie} {s.nazwisko}</span><span className="profil-val" style={{color: s.status === 'Dodano!' ? '#2e7d32' : '#c62828'}}>{s.status}</span></div>
                    <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{s.email}</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {aktywnaZakladka === 'ankiety' && (
          <>
            <h2 className="page-title">Wyniki ankiet</h2>
            <div className="login-field" style={{marginBottom:'12px'}}>
              <label>Filtruj po grupie</label>
              <select value={wybranaGrupaAnkiety} onChange={e => setWybranaGrupaAnkiety(e.target.value)}>
                <option value="">Wszystkie grupy ({ankiety.length} odpowiedzi)</option>
                {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa} ({ankiety.filter((a:any) => a.grupa_id === g.id).length})</option>)}
              </select>
            </div>
            <button className="login-btn" style={{marginBottom:'16px'}} onClick={eksportujAnkietyCSV}>⬇ Pobierz CSV</button>
            {ankietyFiltrowane.length === 0 ? (
              <div className="profil-card"><p style={{color:'var(--text-muted)', textAlign:'center', fontSize:'14px'}}>Brak wypełnionych ankiet.</p></div>
            ) : (
              <div className="profil-card">
                <h3 style={{fontFamily:'Cormorant Garamond, serif', fontSize:'17px', marginBottom:'12px', color:'var(--brand)'}}>Średnie oceny ({ankietyFiltrowane.length} ankiet)</h3>
                {[
                  ['Zadowolenie ze szkolenia', 'zadowolenie'],
                  ['Zajęcia teoretyczne', 'zajecia_teoretyczne'],
                  ['Zajęcia — rysunek techniczny', 'zajecia_rysunek'],
                  ['Zajęcia — programy komputerowe', 'zajecia_programy'],
                  ['Zakres tematyczny', 'zakres_tematyczny'],
                  ['Czas trwania', 'org_czas'],
                  ['Miejsce szkolenia', 'org_miejsce'],
                  ['Baza dydaktyczna', 'org_baza'],
                  ['Materiały szkoleniowe', 'org_materialy'],
                  ['Kadra dydaktyczna', 'org_kadra'],
                  ['Dostosowanie do grupy', 'org_dostosowanie'],
                  ['Spełnienie oczekiwań', 'stopien_oczekiwan'],
                  ['Ocena ogólna', 'ocena_ogolna'],
                ].map(([label, pole]) => (
                  <div key={pole} className="profil-row">
                    <span className="profil-lbl" style={{fontSize:'12px'}}>{label}</span>
                    <span className="profil-val" style={{fontWeight:'700', color:'var(--brand)'}}>
                      {'★'.repeat(Math.round(parseFloat(srednia(pole as keyof OdpowiedziAnkiety, ankietyFiltrowane))))} {srednia(pole as keyof OdpowiedziAnkiety, ankietyFiltrowane)}/5
                    </span>
                  </div>
                ))}
                <div className="profil-row" style={{borderTop:'1px solid #eee', paddingTop:'8px', marginTop:'4px'}}>
                  <span className="profil-lbl" style={{fontSize:'12px'}}>Wiedza wzrosła (Tak)</span>
                  <span className="profil-val" style={{fontWeight:'700', color:'var(--brand)'}}>
                    {ankietyFiltrowane.length > 0
                      ? Math.round(ankietyFiltrowane.filter((a:any) => a.wiedza_wzrosla === 'Tak').length / ankietyFiltrowane.length * 100) + '%'
                      : '—'}
                  </span>
                </div>
                <div className="profil-row">
                  <span className="profil-lbl" style={{fontSize:'12px'}}>Polecenie znajomym (Tak)</span>
                  <span className="profil-val" style={{fontWeight:'700', color:'var(--brand)'}}>
                    {ankietyFiltrowane.length > 0
                      ? Math.round(ankietyFiltrowane.filter((a:any) => a.nps === 'Tak').length / ankietyFiltrowane.length * 100) + '%'
                      : '—'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav" style={{overflowX:'auto'}}>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setEdytowane(null); setAktywnaZakladka('ogloszenia'); }}>
          <Bell size={20} /><span className="nav-label">Ogloszenia</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setEdytowanyZjazd(null); setAktywnaZakladka('zjazdy'); }}>
          <Calendar size={20} /><span className="nav-label">Zjazdy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'kursanci' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('kursanci'); }}>
          <User size={20} /><span className="nav-label">Kursanci</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'grupy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('grupy'); }}>
          <Home size={20} /><span className="nav-label">Grupy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'ankiety' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('ankiety'); }}>
          <Star size={20} /><span className="nav-label">Ankiety</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'import' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('import'); }}>
          <MessageCircle size={20} /><span className="nav-label">Import</span>
        </button>
      </nav>
    </div>
  );
}

function KartaOgloszenia({ o, onClick }: { o: Ogloszenie; onClick: () => void }) {
  return (
    <div className="ann-card" onClick={onClick}>
      <div className="ann-top">
        <div className="ann-left">
          {o.nowe && <div className="unread-dot" />}
          <span className={`badge badge-${o.typ.toLowerCase()}`}>{o.typ}</span>
        </div>
        <span className="arr">›</span>
      </div>
      <div className="ann-title">{o.tytul}</div>
      <div className="ann-preview">{o.tresc}</div>
      <div className="ann-date">{new Date(o.data_utworzenia).toLocaleDateString('pl-PL')}</div>
    </div>
  );
}

function EkranSzczegoly({ o, onWroc }: { o: Ogloszenie; onWroc: () => void }) {
  return (
    <>
      <button className="btn-wroc" onClick={onWroc}>Wroc</button>
      <div className="szczegoly-header">
        <span className={`badge badge-${o.typ.toLowerCase()}`}>{o.typ}</span>
        <h2 className="szczegoly-tytul">{o.tytul}</h2>
        <p className="szczegoly-meta">Biuro On-Arch - {new Date(o.data_utworzenia).toLocaleDateString('pl-PL')}</p>
      </div>
      <div className="szczegoly-tresc">{o.szczegoly}</div>
    </>
  );
}

function EkranGlowny({ ogloszenia, zjazdy, onOtworzOgloszenie, user, kursant }: { ogloszenia: Ogloszenie[]; zjazdy: Zjazd[]; onOtworzOgloszenie: (o: Ogloszenie) => void; user: User; kursant: Kursant | null }) {
  const imie = kursant ? kursant.imie : user.email.split('@')[0];
  const najblizszy = zjazdy.find(z => z.status === 'nadchodzacy');
  return (
    <>
      <p className="greeting">Dzien dobry, {imie}</p>
      <section className="section">
        <div className="section-header"><span className="section-title">Najblizszy zjazd</span></div>
        {najblizszy ? (
          <div className="hero-card">
            <div className="hero-label">Zjazd {najblizszy.nr}</div>
            <div className="hero-date">{najblizszy.daty}</div>
            <div className="hero-sub">{kursant?.grupy?.miasto || 'Warszawa'}</div>
            <div className="hero-pills">
              <span className="pill">{najblizszy.sala}</span>
              <span className="pill">{najblizszy.adres}</span>
            </div>
          </div>
        ) : (
          <div className="hero-card"><div className="hero-date">Brak nadchodzacych zjazdow</div></div>
        )}
      </section>
      <section className="section">
        <div className="section-header"><span className="section-title">Ogloszenia biura</span></div>
        {ogloszenia.slice(0, 3).map((o) => (
          <KartaOgloszenia key={o.id} o={o} onClick={() => onOtworzOgloszenie(o)} />
        ))}
      </section>
    </>
  );
}

function EkranZjazdy({ zjazdy }: { zjazdy: Zjazd[] }) {
  return (
    <>
      <h2 className="page-title">Plan zjazdow</h2>
      {zjazdy.map((z) => (
        <div key={z.id} className={`sess-card ${z.status}`}>
          <div className="sess-top">
            <span className="sess-nr">Zjazd {z.nr}</span>
            <span className={`s-badge s-${z.status}`}>{z.status === 'nadchodzacy' ? 'Nadchodzacy' : 'Zakonczony'}</span>
          </div>
          <div className="sess-date">{z.daty}</div>
          <div className="sess-rows">
            <div className="sess-row">{z.sala}</div>
            <div className="sess-row">{z.adres}</div>
            <div className="sess-row">{z.tematy}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function EkranOgloszenia({ ogloszenia, onOtworzOgloszenie }: { ogloszenia: Ogloszenie[]; onOtworzOgloszenie: (o: Ogloszenie) => void }) {
  return (
    <>
      <h2 className="page-title">Ogloszenia</h2>
      {ogloszenia.map((o) => (
        <KartaOgloszenia key={o.id} o={o} onClick={() => onOtworzOgloszenie(o)} />
      ))}
    </>
  );
}

function EkranProfil({ user, kursant, onWyloguj, onAvatarZmieniony }: { user: User; kursant: Kursant | null; onWyloguj: () => void; onAvatarZmieniony: (url: string) => void }) {
  const [uploadowanie, setUploadowanie] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const inicjal = kursant ? kursant.imie[0] : user.email[0].toUpperCase();
  const nazwaGrupy = kursant?.grupy?.nazwa || 'Brak przypisania do grupy';
  const miasto = kursant?.grupy?.miasto || '';
  const edycja = kursant?.grupy?.edycja || '';

  async function wgrajZdjecie(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadowanie(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { alert('Blad wgrywania: ' + uploadError.message); setUploadowanie(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl;
    await supabase.from('kursanci').update({ avatar_url: url }).eq('user_id', user.id);
    onAvatarZmieniony(url);
    setUploadowanie(false);
  }

  return (
    <>
      <div className="profil-header">
        <div className="profil-avatar-wrap" onClick={() => fileRef.current?.click()}>
          {kursant?.avatar_url ? (
            <img src={kursant.avatar_url} alt="avatar" className="profil-avatar-img" />
          ) : (
            <div className="profil-avatar">{inicjal.toUpperCase()}</div>
          )}
          <div className="profil-avatar-edit">{uploadowanie ? '...' : '📷'}</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={wgrajZdjecie} style={{display:'none'}} />
        <div className="profil-name">{kursant ? `${kursant.imie} ${kursant.nazwisko}` : user.email}</div>
        <div className="profil-group">{nazwaGrupy}</div>
      </div>
      <div className="profil-card">
        <div className="profil-row"><span className="profil-lbl">Kurs</span><span className="profil-val">Projektowanie wnetrz</span></div>
        <div className="profil-row"><span className="profil-lbl">Miasto</span><span className="profil-val">{miasto}</span></div>
        <div className="profil-row"><span className="profil-lbl">Edycja</span><span className="profil-val">{edycja}</span></div>
        <div className="profil-row"><span className="profil-lbl">Email</span><span className="profil-val">{user.email}</span></div>
        <div className="profil-row"><span className="profil-lbl">Telefon biura</span><span className="profil-val">883 659 069</span></div>
      </div>
      <button className="btn-wyloguj" onClick={onWyloguj}>Wyloguj sie</button>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [kursant, setKursant] = useState<Kursant | null>(null);
  const [aktywnaZakladka, setAktywnaZakladka] = useState('home');
  const [aktywneOgloszenie, setAktywneOgloszenie] = useState<Ogloszenie | null>(null);
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
      setLadowanie(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setResetMode(true);
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function pobierzDane() {
      const { data: kursantData } = await supabase
        .from('kursanci')
        .select('imie, nazwisko, grupa_id, rola, avatar_url')
        .eq('user_id', user!.id)
        .single();

      let grupaData = null;
      if (kursantData?.grupa_id) {
        const { data } = await supabase.from('grupy').select('nazwa, miasto, edycja').eq('id', kursantData.grupa_id).single();
        grupaData = data;
      }

      setKursant(kursantData ? { ...kursantData, grupy: grupaData } as Kursant : null);

      // Automatycznie oznacz przeterminowane zjazdy jako zakonczony
      await aktualizujStatusyZjazdow();

      const grupaId = kursantData?.grupa_id;
      const [{ data: og }, { data: zj }] = await Promise.all([
        supabase.from('ogloszenia').select('*').order('data_utworzenia', { ascending: false }),
        grupaId
          ? supabase.from('zjazdy').select('*').eq('grupa_id', grupaId).order('data_zjazdu', { ascending: true })
          : supabase.from('zjazdy').select('*').order('data_zjazdu', { ascending: true }),
      ]);
      setOgloszenia(og || []);
      setZjazdy(zj || []);
    }
    pobierzDane();
  }, [user]);

  async function aktualizujStatusyZjazdow() {
    const dzisiaj = new Date().toISOString().split('T')[0];

    const { data: przestarzale } = await supabase
      .from('zjazdy')
      .select('*')
      .eq('status', 'nadchodzacy')
      .lt('data_zjazdu', dzisiaj);

    if (!przestarzale || przestarzale.length === 0) return;

    for (const zjazd of przestarzale) {
      await supabase.from('zjazdy').update({ status: 'zakonczony' }).eq('id', zjazd.id);

      const { data: wszystkieZjazdy } = await supabase
        .from('zjazdy')
        .select('*')
        .eq('grupa_id', zjazd.grupa_id)
        .order('data_zjazdu', { ascending: true });

      const pozostaleNadchodzace = (wszystkieZjazdy || []).filter(
        z => z.id !== zjazd.id && z.status === 'nadchodzacy' && z.data_zjazdu >= dzisiaj
      );

      if (pozostaleNadchodzace.length === 0) {
        const { data: istniejacePowiadomienie } = await supabase
          .from('ogloszenia')
          .select('id')
          .eq('tytul', 'Wypełnij ankietę oceny kursu ⭐')
          .maybeSingle();

        if (!istniejacePowiadomienie) {
          const { data: grupaInfo } = await supabase
            .from('grupy').select('nazwa').eq('id', zjazd.grupa_id).single();
          const nazwaGrupy = grupaInfo?.nazwa || 'Twoja grupa';

          await supabase.from('ogloszenia').insert([{
            typ: 'Informacja',
            tytul: 'Wypełnij ankietę oceny kursu ⭐',
            tresc: 'Twój kurs dobiegł końca. Prosimy o wypełnienie krótkiej ankiety — to tylko kilka minut!',
            szczegoly: 'Dziękujemy za udział w kursie ' + nazwaGrupy + '!\n\nTwoja opinia jest dla nas bardzo ważna i pomoże nam udoskonalić kolejne edycje kursu.\n\nProsimy o wypełnienie krótkiej ankiety oceniającej szkolenie. Znajdziesz ją w aplikacji, w zakładce Ankieta w dolnym menu.\n\nZ góry dziękujemy!\nZespół On-Arch',
            nowe: true,
            data_utworzenia: new Date().toISOString(),
          }]);
        }
      }
    }
  }

  async function wyloguj() {
    await supabase.auth.signOut();
    setUser(null);
    setKursant(null);
    setResetMode(false);
  }

  async function otworzOgloszenie(o: Ogloszenie) {
    setAktywneOgloszenie(o);
    if (o.nowe) {
      await supabase.from('ogloszenia').update({ nowe: false }).eq('id', o.id);
      setOgloszenia(prev => prev.map(og => og.id === o.id ? { ...og, nowe: false } : og));
    }
  }

  function onAvatarZmieniony(url: string) {
    setKursant(prev => prev ? { ...prev, avatar_url: url } : prev);
  }

  const noweCount = ogloszenia.filter((o) => o.nowe).length;
  const avatarUrl = kursant?.avatar_url;
  const inicjal = kursant ? kursant.imie[0] : user?.email?.[0]?.toUpperCase() || '?';

  // Sprawdź czy ankieta jest dostępna (ostatni zjazd zakończony)
  const ostatniZjazd = zjazdy.length > 0 ? zjazdy[zjazdy.length - 1] : null;
  const ankietaDostepna = ostatniZjazd?.status === 'zakonczony';

  if (ladowanie) return <div className="ladowanie">Ladowanie...</div>;
  if (resetMode) return <EkranZmianaHasla />;
  if (!user) return <EkranLogowania onZalogowano={() => {}} />;
  if (kursant?.rola === 'admin') return <PanelBiura onWyloguj={wyloguj} />;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">On<span>-Arch</span></div>
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="avatar-img" />
        ) : (
          <div className="avatar">{inicjal.toUpperCase()}</div>
        )}
      </header>
      <main className="main">
        {aktywneOgloszenie ? (
          <EkranSzczegoly o={aktywneOgloszenie} onWroc={() => setAktywneOgloszenie(null)} />
        ) : (
          <>
            {aktywnaZakladka === 'home' && <EkranGlowny ogloszenia={ogloszenia} zjazdy={zjazdy} onOtworzOgloszenie={otworzOgloszenie} user={user} kursant={kursant} />}
            {aktywnaZakladka === 'zjazdy' && <EkranZjazdy zjazdy={zjazdy} />}
            {aktywnaZakladka === 'ogloszenia' && <EkranOgloszenia ogloszenia={ogloszenia} onOtworzOgloszenie={otworzOgloszenie} />}
            {aktywnaZakladka === 'czat' && <EkranCzat user={user} kursant={kursant} />}
            {aktywnaZakladka === 'ankieta' && <EkranAnkieta kursant={kursant} zjazdy={zjazdy} user={user} />}
            {aktywnaZakladka === 'profil' && <EkranProfil user={user} kursant={kursant} onWyloguj={wyloguj} onAvatarZmieniony={onAvatarZmieniony} />}
          </>
        )}
      </main>
      <nav className="bottom-nav">
        <button className={`nav-item ${aktywnaZakladka === 'home' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('home'); }}>
          <Home size={20} /><span className="nav-label">Glowna</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('zjazdy'); }}>
          <Calendar size={20} /><span className="nav-label">Zjazdy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('ogloszenia'); }}>
          <Bell size={20} /><span className="nav-label">Ogloszenia</span>
          {noweCount > 0 && <span className="nav-badge">{noweCount}</span>}
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'czat' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('czat'); }}>
          <MessageCircle size={20} /><span className="nav-label">Czat</span>
        </button>
        <button
          className={`nav-item ${aktywnaZakladka === 'ankieta' ? 'active' : ''}`}
          onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('ankieta'); }}
          style={{ opacity: ankietaDostepna ? 1 : 0.4 }}
        >
          <Star size={20} /><span className="nav-label">Ankieta</span>
          {ankietaDostepna && <span className="nav-badge" style={{background:'#A05C5C'}}>!</span>}
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'profil' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('profil'); }}>
          <User size={20} /><span className="nav-label">Profil</span>
        </button>
      </nav>
    </div>
  );
}
