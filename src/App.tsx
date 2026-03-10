import { useState, useEffect, useRef } from 'react';
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
          <div className="login-logo"><div className="logo"><img src="/on arch circle icon red.png" alt="On-Arch" /></div></div>
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
        <div className="login-logo"><div className="logo"><img src="/on arch circle icon red.png" alt="On-Arch" /></div></div>
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
    if (error) { setBlad('Nieprawidlowy email lub haslo'); }
    else { onZalogowano(); }
    setLadowanie(false);
  }

  async function resetHasla(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true);
    setBlad('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://on-arch-7afx.vercel.app' });
    if (error) { setBlad('Blad wysylania emaila. Sprawdz adres.'); }
    else { setResetWyslany(true); }
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
          <button className="login-btn" type="submit" disabled={ladowanie}>{ladowanie ? 'Logowanie...' : 'Zaloguj sie'}</button>
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
        <input
          className="czat-input"
          type="text"
          value={nowa}
          onChange={e => setNowa(e.target.value)}
          placeholder="Napisz wiadomosc..."
          disabled={wysylanie}
          maxLength={500}
        />
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
  const [edytowane, setEdytowane] = useState<Ogloszenie | null>(null);
  const [edytowanyZjazd, setEdytowanyZjazd] = useState<Zjazd | null>(null);
  const [noweOgl, setNoweOgl] = useState({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true });
  const [nowyZjazd, setNowyZjazd] = useState({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '' });
  const [nowyKursant, setNowyKursant] = useState({ imie: '', nazwisko: '', email: '', grupa_id: '' });
  const [nowaGrupa, setNowaGrupa] = useState({ nazwa: '', miasto: '', edycja: '' });
  const [komunikat, setKomunikat] = useState('');
  const [importStatus, setImportStatus] = useState<{imie: string; nazwisko: string; email: string; status: string}[]>([]);
  const [importowanie, setImportowanie] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pobierzGrupy();
    pobierzOgloszenia();
    pobierzZjazdy();
    supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id').then(({ data }) => setKursanci((data || []) as unknown as KursantAdmin[]));
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
    const { error } = await supabase.from('zjazdy').update({
      nr: edytowanyZjazd.nr, daty: edytowanyZjazd.daty, sala: edytowanyZjazd.sala,
      adres: edytowanyZjazd.adres, tematy: edytowanyZjazd.tematy,
      status: edytowanyZjazd.status, data_zjazdu: edytowanyZjazd.data_zjazdu,
      grupa_id: edytowanyZjazd.grupa_id,
    }).eq('id', edytowanyZjazd.id);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Zjazd zaktualizowany!'); setEdytowanyZjazd(null); pobierzZjazdy(); }
  }

  async function usunZjazd(id: number) {
    if (!window.confirm('Czy na pewno chcesz usunac ten zjazd?')) return;
    const { error } = await supabase.from('zjazdy').delete().eq('id', id);
    if (error) { setKomunikat('Blad: ' + error.message); }
    else { setKomunikat('Zjazd usuniety!'); pobierzZjazdy(); }
  }

  async function dodajKursanta(e: React.FormEvent) {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: nowyKursant.email,
      password: Math.random().toString(36).slice(-10),
    });
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password: Math.random().toString(36).slice(-10),
      });
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
      </main>
      <nav className="bottom-nav" style={{overflowX:'auto'}}>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setEdytowane(null); setAktywnaZakladka('ogloszenia'); }}>
          <span className="nav-icon">🔔</span><span className="nav-label">Ogloszenia</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setEdytowanyZjazd(null); setAktywnaZakladka('zjazdy'); }}>
          <span className="nav-icon">📅</span><span className="nav-label">Zjazdy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'kursanci' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('kursanci'); }}>
          <span className="nav-icon">👥</span><span className="nav-label">Kursanci</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'grupy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('grupy'); }}>
          <span className="nav-icon">🏫</span><span className="nav-label">Grupy</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'import' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('import'); }}>
          <span className="nav-icon">📂</span><span className="nav-label">Import</span>
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
        .select('imie, nazwisko, grupa_id, rola')
        .eq('user_id', user!.id)
        .single();

      let grupaData = null;
      if (kursantData?.grupa_id) {
        const { data } = await supabase.from('grupy').select('nazwa, miasto, edycja').eq('id', kursantData.grupa_id).single();
        grupaData = data;
      }

      setKursant(kursantData ? { ...kursantData, grupy: grupaData } as Kursant : null);

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

  async function otworzOgloszenie(o: Ogloszenie) {
    setAktywneOgloszenie(o);
    if (o.nowe) {
      await supabase.from('ogloszenia').update({ nowe: false }).eq('id', o.id);
      setOgloszenia(prev => prev.map(og => og.id === o.id ? { ...og, nowe: false } : og));
    }
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
            {aktywnaZakladka === 'home' && <EkranGlowny ogloszenia={ogloszenia} zjazdy={zjazdy} onOtworzOgloszenie={otworzOgloszenie} user={user} kursant={kursant} />}
            {aktywnaZakladka === 'zjazdy' && <EkranZjazdy zjazdy={zjazdy} />}
            {aktywnaZakladka === 'ogloszenia' && <EkranOgloszenia ogloszenia={ogloszenia} onOtworzOgloszenie={otworzOgloszenie} />}
            {aktywnaZakladka === 'czat' && <EkranCzat user={user} kursant={kursant} />}
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
        <button className={`nav-item ${aktywnaZakladka === 'czat' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('czat'); }}>
          <span className="nav-icon">💬</span><span className="nav-label">Czat</span>
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'profil' ? 'active' : ''}`} onClick={() => { setAktywneOgloszenie(null); setAktywnaZakladka('profil'); }}>
          <span className="nav-icon">👤</span><span className="nav-label">Profil</span>
        </button>
      </nav>
    </div>
  );
}