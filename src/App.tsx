import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabase';

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
  grupy: { nazwa: string; miasto: string; edycja: string } | null;
};

type KursantAdmin = {
  id: number;
  imie: string;
  nazwisko: string;
  grupa_id: number;
  user_id: string;
  grupy: { nazwa: string }[] | null;
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
    if (error) {
      setBlad('Blad zmiany hasla. Sprobuj ponownie.');
    } else {
      setSukces(true);
    }
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
          <button className="login-btn" style={{marginTop: '20px'}} onClick={() => window.location.href = '/'}>
            Przejdz do logowania
          </button>
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
          <button className="login-btn" type="submit" disabled={ladowanie}>
            {ladowanie ? 'Zapisywanie...' : 'Ustaw haslo'}
          </button>
        </form>
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

  async function zaloguj(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true);
    setBlad('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: haslo });
    if (error) {
      setBlad('Nieprawidlowy email lub haslo');
    } else {
      onZalogowano();
    }
    setLadowanie(false);
  }

  async function resetHasla(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true);
    setBlad('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://on-arch-7afx.vercel.app',
    });
    if (error) {
      setBlad('Blad wysylania emaila. Sprawdz adres.');
    } else {
      setResetWyslany(true);
    }
    setLadowanie(false);
  }

  if (resetWyslany) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">On<span>-Arch</span></div>
          <div className="reset-success">
            <div className="reset-icon">✉️</div>
            <h3>Sprawdz skrzynke</h3>
            <p>Wyslalismy link do resetowania hasla na adres <strong>{email}</strong></p>
          </div>
          <button className="login-btn" style={{marginTop: '20px'}} onClick={() => { setResetMode(false); setResetWyslany(false); }}>
            Wroce do logowania
          </button>
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
            <button className="login-btn" type="submit" disabled={ladowanie}>
              {ladowanie ? 'Wysylanie...' : 'Wyslij link resetujacy'}
            </button>
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
          <button className="login-btn" type="submit" disabled={ladowanie}>
            {ladowanie ? 'Logowanie...' : 'Zaloguj sie'}
          </button>
        </form>
        <button className="btn-link" onClick={() => setResetMode(true)}>Nie pamietasz hasla?</button>
        <p className="login-kontakt">Problemy z logowaniem? Zadzwon do biura:<br/><strong>883 659 069</strong></p>
      </div>
    </div>
  );
}

function PanelBiura({ onWyloguj }: { onWyloguj: () => void }) {
  const [aktywnaZakladka, setAktywnaZakladka] = useState('ogloszenia');
  const [grupy, setGrupy] = useState<Grupa[]>([]);
  const [kursanci, setKursanci] = useState<KursantAdmin[]>([]);

  const [noweOgl, setNoweOgl] = useState({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true });
  const [nowyZjazd, setNowyZjazd] = useState({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '' });
  const [nowyKursant, setNowyKursant] = useState({ imie: '', nazwisko: '', email: '', grupa_id: '' });
  const [komunikat, setKomunikat] = useState('');

  useEffect(() => {
    supabase.from('grupy').select('*').then(({ data }) => setGrupy(data || []));
    supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id, grupy(nazwa)').then(({ data }) => setKursanci((data || []) as unknown as KursantAdmin[]));
  }, []);

  async function dodajOgloszenie(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('ogloszenia').insert([{ ...noweOgl, data_utworzenia: new Date().toISOString() }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Ogloszenie dodane!'); setNoweOgl({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true }); }
  }

  async function dodajZjazd(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('zjazdy').insert([{ ...nowyZjazd, nr: parseInt(nowyZjazd.nr), grupa_id: parseInt(nowyZjazd.grupa_id) }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Zjazd dodany!'); setNowyZjazd({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '' }); }
  }

  async function dodajKursanta(e: React.FormEvent) {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: nowyKursant.email,
      password: Math.random().toString(36).slice(-10),
    });
    if (authError) { setKomunikat('Blad tworzenia konta: ' + authError.message); return; }
    const { error } = await supabase.from('kursanci').insert([{
      imie: nowyKursant.imie,
      nazwisko: nowyKursant.nazwisko,
      grupa_id: parseInt(nowyKursant.grupa_id),
      user_id: authData.user!.id,
      rola: 'kursant',
    }]);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else {
      setKomunikat('Kursant dodany! Email z linkiem zostal wyslany.');
      setNowyKursant({ imie: '', nazwisko: '', email: '', grupa_id: '' });
      const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id, grupy(nazwa)');
      setKursanci((data || []) as unknown as KursantAdmin[]);
    }
  }

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
            <h2 className="page-title">Nowe ogloszenie</h2>
            <form className="admin-form" onSubmit={dodajOgloszenie}>
              <div className="login-field">
                <label>Typ</label>
                <select value={noweOgl.typ} onChange={e => setNoweOgl({...noweOgl, typ: e.target.value})}>
                  <option>Informacja</option>
                  <option>Pilne</option>
                  <option>Zmiana</option>
                </select>
              </div>
              <div className="login-field">
                <label>Tytul</label>
                <input type="text" value={noweOgl.tytul} onChange={e => setNoweOgl({...noweOgl, tytul: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Krotki opis</label>
                <input type="text" value={noweOgl.tresc} onChange={e => setNoweOgl({...noweOgl, tresc: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Pelna tresc</label>
                <textarea value={noweOgl.szczegoly} onChange={e => setNoweOgl({...noweOgl, szczegoly: e.target.value})} rows={4} />
              </div>
              <button className="login-btn" type="submit">Dodaj ogloszenie</button>
            </form>
          </>
        )}

        {aktywnaZakladka === 'zjazdy' && (
          <>
            <h2 className="page-title">Nowy zjazd</h2>
            <form className="admin-form" onSubmit={dodajZjazd}>
              <div className="login-field">
                <label>Grupa</label>
                <select value={nowyZjazd.grupa_id} onChange={e => setNowyZjazd({...nowyZjazd, grupa_id: e.target.value})} required>
                  <option value="">Wybierz grupe</option>
                  {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                </select>
              </div>
              <div className="login-field">
                <label>Numer zjazdu</label>
                <input type="number" value={nowyZjazd.nr} onChange={e => setNowyZjazd({...nowyZjazd, nr: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Daty (np. 22-23 marca 2025)</label>
                <input type="text" value={nowyZjazd.daty} onChange={e => setNowyZjazd({...nowyZjazd, daty: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Data zjazdu</label>
                <input type="date" value={nowyZjazd.data_zjazdu} onChange={e => setNowyZjazd({...nowyZjazd, data_zjazdu: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Sala</label>
                <input type="text" value={nowyZjazd.sala} onChange={e => setNowyZjazd({...nowyZjazd, sala: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Adres</label>
                <input type="text" value={nowyZjazd.adres} onChange={e => setNowyZjazd({...nowyZjazd, adres: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Tematy</label>
                <input type="text" value={nowyZjazd.tematy} onChange={e => setNowyZjazd({...nowyZjazd, tematy: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Status</label>
                <select value={nowyZjazd.status} onChange={e => setNowyZjazd({...nowyZjazd, status: e.target.value})}>
                  <option value="nadchodzacy">Nadchodzacy</option>
                  <option value="zakonczony">Zakonczony</option>
                </select>
              </div>
              <button className="login-btn" type="submit">Dodaj zjazd</button>
            </form>
          </>
        )}

        {aktywnaZakladka === 'kursanci' && (
          <>
            <h2 className="page-title">Nowy kursant</h2>
            <form className="admin-form" onSubmit={dodajKursanta}>
              <div className="login-field">
                <label>Imie</label>
                <input type="text" value={nowyKursant.imie} onChange={e => setNowyKursant({...nowyKursant, imie: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Nazwisko</label>
                <input type="text" value={nowyKursant.nazwisko} onChange={e => setNowyKursant({...nowyKursant, nazwisko: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Email</label>
                <input type="email" value={nowyKursant.email} onChange={e => setNowyKursant({...nowyKursant, email: e.target.value})} required />
              </div>
              <div className="login-field">
                <label>Grupa</label>
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
                <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{k.grupy?.[0]?.nazwa || '-'}</span></div>
              </div>
            ))}
          </>
        )}
      </main>
      <nav className="bottom-nav">
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('ogloszenia'); }}>
          <span className="nav-icon">🔔</span><span className="nav-label">Ogloszenia</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('zjazdy'); }}>
          <span className="nav-icon">📅</span><span className="nav-label">Zjazdy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'kursanci' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('kursanci'); }}>
          <span className="nav-icon">👥</span><span className="nav-label">Kursanci</span>
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
        <div className="section-header">
          <span className="section-title">Najblizszy zjazd</span>
        </div>
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
        <div className="section-header">
          <span className="section-title">Ogloszenia biura</span>
        </div>
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

function EkranProfil({ user, kursant, onWyloguj }: { user: User; kursant: Kursant | null; onWyloguj: () => void }) {
  const inicjal = kursant ? kursant.imie[0] : user.email[0].toUpperCase();
  const nazwaGrupy = kursant?.grupy?.nazwa || 'Brak przypisania do grupy';
  const miasto = kursant?.grupy?.miasto || '';
  const edycja = kursant?.grupy?.edycja || '';
  return (
    <>
      <div className="profil-header">
        <div className="profil-avatar">{inicjal.toUpperCase()}</div>
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
      if (event === 'PASSWORD_RECOVERY') {
        setResetMode(true);
      }
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function pobierzDane() {
      const { data: kursantData } = await supabase
        .from('kursanci')
        .select('imie, nazwisko, grupa_id, rola')
        .eq('user_id', user!.id)
        .single();

      let grupaData = null;
      if (kursantData?.grupa_id) {
        const { data } = await supabase
          .from('grupy')
          .select('nazwa, miasto, edycja')
          .eq('id', kursantData.grupa_id)
          .single();
        grupaData = data;
      }

      const kursantZGrupa = kursantData ? { ...kursantData, grupy: grupaData } : null;
      setKursant(kursantZGrupa as Kursant | null);

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

  async function wyloguj() {
    await supabase.auth.signOut();
    setUser(null);
    setKursant(null);
    setResetMode(false);
  }

  const noweCount = ogloszenia.filter((o) => o.nowe).length;

  if (ladowanie) return <div className="ladowanie">Ladowanie...</div>;
  if (resetMode) return <EkranZmianaHasla />;
  if (!user) return <EkranLogowania onZalogowano={() => {}} />;
  if (kursant?.rola === 'admin') return <PanelBiura onWyloguj={wyloguj} />;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">On<span>-Arch</span></div>
        <div className="avatar">{(kursant ? kursant.imie[0] : user.email[0]).toUpperCase()}</div>
      </header>
      <main className="main">
        {aktywneOgloszenie ? (
          <EkranSzczegoly o={aktywneOgloszenie} onWroc={() => setAktywneOgloszenie(null)} />
        ) : (
          <>
            {aktywnaZakladka === 'home' && <EkranGlowny ogloszenia={ogloszenia} zjazdy={zjazdy} onOtworzOgloszenie={setAktywneOgloszenie} user={user} kursant={kursant} />}
            {aktywnaZakladka === 'zjazdy' && <EkranZjazdy zjazdy={zjazdy} />}
            {aktywnaZakladka === 'ogloszenia' && <EkranOgloszenia ogloszenia={ogloszenia} onOtworzOgloszenie={setAktywneOgloszenie} />}
            {aktywnaZakladka === 'profil' && <EkranProfil user={user} kursant={kursant} onWyloguj={wyloguj} />}
          </>
        )}
      </main>
      <nav className="bottom-nav">
        <button className={`nav-item ${aktywnaZakladka === 'home' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('home'); }}>
          <span className="nav-icon">🏠</span><span className="nav-label">Glowna</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('zjazdy'); }}>
          <span className="nav-icon">📅</span><span className="nav-label">Zjazdy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('ogloszenia'); }}>
          <span className="nav-icon">🔔</span><span className="nav-label">Ogloszenia</span>
          {noweCount > 0 && <span className="nav-badge">{noweCount}</span>}
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'profil' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('profil'); }}>
          <span className="nav-icon">👤</span><span className="nav-label">Profil</span>
        </button>
      </nav>
    </div>
  );
}