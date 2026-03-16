import { useState, useEffect, useRef } from 'react';
import './App.css';
import { supabase } from './supabase';
import { Home, Calendar, Bell, MessageCircle, User, Star, CheckSquare, BookOpen } from 'lucide-react';

type Ogloszenie = {
  id: string;
  typ: string;
  tytul: string;
  tresc: string;
  szczegoly: string;
  nowe: boolean;
  data_utworzenia: string;
  grupa_id: number | null;
};

type Prowadzacy = {
  id: number;
  imie: string;
  nazwisko: string;
  bio: string | null;
  avatar_url: string | null;
};

type Notatka = {
  id: number;
  kursant_user_id: string;
  prowadzacy_id: number;
  tresc: string;
  created_at: string;
  updated_at: string;
};

type Zadanie = {
  id: number;
  grupa_id: number;
  tytul: string;
  opis: string | null;
  termin: string | null;
  link_materialow: string | null;
  typ: string;
  created_at: string;
};

type ZadanieOdpowiedz = {
  id: number;
  zadanie_id: number;
  user_id: string;
  imie: string;
  nazwisko: string;
  link_pracy: string;
  komentarz: string | null;
  created_at: string;
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
  prowadzacy?: Prowadzacy[];
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
  drive_link: string | null;
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

type Obecnosc = {
  id: string;
  zjazd_id: number;
  user_id: string;
  imie: string;
  nazwisko: string;
  confirmed_at: string;
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

// ─── EKRAN ZADANIA (kursant) ─────────────────────────────────────────────────

function EkranZadania({ user, kursant }: { user: User; kursant: Kursant | null }) {
  const [zadania, setZadania] = useState<Zadanie[]>([]);
  const [odpowiedzi, setOdpowiedzi] = useState<ZadanieOdpowiedz[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [aktywneZadanie, setAktywneZadanie] = useState<Zadanie | null>(null);
  const [linkPracy, setLinkPracy] = useState('');
  const [komentarz, setKomentarz] = useState('');
  const [wysylanie, setWysylanie] = useState(false);
  const [sukces, setSukces] = useState<number | null>(null);

  useEffect(() => {
    if (!kursant?.grupa_id) return;
    pobierz();
  }, [kursant]);

  async function pobierz() {
    setLadowanie(true);
    const [{ data: zad }, { data: odp }] = await Promise.all([
      supabase.from('zadania').select('*').eq('grupa_id', kursant!.grupa_id).order('created_at', { ascending: false }),
      supabase.from('zadania_odpowiedzi').select('*').eq('user_id', user.id),
    ]);
    setZadania(zad || []);
    setOdpowiedzi(odp || []);
    setLadowanie(false);
  }

  const odpowiedzDlaZadania = (zid: number) => odpowiedzi.find(o => o.zadanie_id === zid);

  async function wyslij(zadanie: Zadanie) {
    if (!linkPracy.trim() || !kursant) return;
    setWysylanie(true);
    const istniejaca = odpowiedzDlaZadania(zadanie.id);
    if (istniejaca) {
      await supabase.from('zadania_odpowiedzi').update({ link_pracy: linkPracy, komentarz: komentarz || null }).eq('id', istniejaca.id);
    } else {
      await supabase.from('zadania_odpowiedzi').insert([{
        zadanie_id: zadanie.id,
        user_id: user.id,
        imie: kursant.imie,
        nazwisko: kursant.nazwisko,
        link_pracy: linkPracy,
        komentarz: komentarz || null,
      }]);
    }
    setSukces(zadanie.id);
    setAktywneZadanie(null);
    setLinkPracy('');
    setKomentarz('');
    await pobierz();
    setWysylanie(false);
  }

  if (!kursant?.grupa_id) return (
    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      Nie jesteś przypisany do żadnej grupy.
    </div>
  );

  return (
    <>
      <h2 className="page-title">Zadania</h2>

      {ladowanie && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Ładowanie...</div>}

      {!ladowanie && zadania.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontSize: '14px' }}>Brak zadań. Pojawią się tutaj gdy prowadzący doda nowe.</p>
        </div>
      )}

      {/* Praca zaliczeniowa — zawsze na górze jeśli istnieje */}
      {zadania.filter(z => z.typ === 'praca_zaliczeniowa').map(z => {
        const odp = odpowiedzDlaZadania(z.id);
        const wyslano = !!odp;
        const rozwinięte = aktywneZadanie?.id === z.id;
        return (
          <div key={z.id} className="sess-card" style={{
            marginBottom: '16px',
            borderColor: wyslano ? '#7aab8a' : 'var(--brand)',
            borderWidth: '1.5px',
          }}>
            <div className="sess-top" style={{ background: wyslano ? '#f0faf4' : 'var(--brand-dark)' }}>
              <span className="sess-nr" style={{ fontSize: '13px', color: wyslano ? 'var(--text)' : 'white' }}>
                🎓 {z.tytul}
              </span>
              {wyslano
                ? <span style={{ fontSize: '10px', fontWeight: 600, color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>✓ Przesłano</span>
                : <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>Praca zaliczeniowa</span>
              }
            </div>
            <div className="sess-rows">
              {z.opis && <div className="sess-row" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{renderTekstZLinkami(z.opis)}</div>}
              {z.link_materialow && (
                <div className="sess-row" style={{ marginTop: '6px' }}>
                  <span className="sess-lbl">Materiały:</span>{' '}
                  <a href={z.link_materialow} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--brand)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px', fontSize: '12px' }}>
                    Otwórz link →
                  </a>
                </div>
              )}
              {z.termin && (
                <div className="sess-row" style={{ marginTop: '4px' }}>
                  <span className="sess-lbl">Termin:</span> {new Date(z.termin).toLocaleDateString('pl-PL')}
                </div>
              )}
            </div>
            {wyslano && !rozwinięte && (
              <div style={{ padding: '0 14px 12px' }}>
                <div style={{ background: '#f0faf4', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Twoja praca</p>
                  <a href={odp!.link_pracy} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                    {odp!.link_pracy}
                  </a>
                  {odp!.komentarz && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{odp!.komentarz}</p>}
                </div>
                <button onClick={() => { setAktywneZadanie(z); setLinkPracy(odp!.link_pracy); setKomentarz(odp!.komentarz || ''); }}
                  style={{ marginTop: '8px', fontSize: '12px', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  Edytuj odpowiedź
                </button>
              </div>
            )}
            {rozwinięte && (
              <div style={{ padding: '0 14px 14px' }}>
                <div className="login-field" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px' }}>Link do pracy (Google Drive, Dropbox...)</label>
                  <input type="url" value={linkPracy} onChange={e => setLinkPracy(e.target.value)} placeholder="https://drive.google.com/..." style={{ fontSize: '13px' }} />
                </div>
                <div className="login-field" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px' }}>Komentarz (opcjonalnie)</label>
                  <textarea value={komentarz} onChange={e => setKomentarz(e.target.value)} rows={2} placeholder="np. wersja robocza..." style={{ fontSize: '13px', resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => wyslij(z)} disabled={wysylanie || !linkPracy.trim()} className="login-btn" style={{ flex: 1, marginTop: 0, padding: '10px' }}>
                    {wysylanie ? 'Wysyłanie...' : 'Prześlij pracę zaliczeniową'}
                  </button>
                  <button onClick={() => { setAktywneZadanie(null); setLinkPracy(''); setKomentarz(''); }}
                    style={{ padding: '10px 16px', borderRadius: '12px', border: '0.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Anuluj
                  </button>
                </div>
              </div>
            )}
            {!wyslano && !rozwinięte && (
              <div style={{ padding: '0 14px 14px' }}>
                <button onClick={() => setAktywneZadanie(z)} className="login-btn" style={{ width: '100%', marginTop: 0, padding: '10px' }}>
                  Prześlij pracę zaliczeniową
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Zadania domowe */}
      {zadania.filter(z => z.typ !== 'praca_zaliczeniowa').length > 0 && (
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 400 }}>
          Zadania domowe
        </h3>
      )}

      {zadania.filter(z => z.typ !== 'praca_zaliczeniowa').map(z => {
        const odp = odpowiedzDlaZadania(z.id);
        const wyslano = !!odp;
        const rozwinięte = aktywneZadanie?.id === z.id;

        return (
          <div key={z.id} className="sess-card" style={{ marginBottom: '10px', borderColor: wyslano ? '#7aab8a' : undefined }}>
            <div className="sess-top" style={{ background: wyslano ? '#f0faf4' : 'var(--brand-light)' }}>
              <span className="sess-nr" style={{ fontSize: '13px' }}>{z.tytul}</span>
              {wyslano
                ? <span style={{ fontSize: '10px', fontWeight: 600, color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>✓ Przesłano</span>
                : z.termin
                  ? <span style={{ fontSize: '10px', color: 'var(--brand-dark)', background: 'var(--brand-light)', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 }}>do {new Date(z.termin).toLocaleDateString('pl-PL')}</span>
                  : null
              }
            </div>
            <div className="sess-rows">
              {z.opis && <div className="sess-row" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{renderTekstZLinkami(z.opis)}</div>}
              {z.link_materialow && (
                <div className="sess-row" style={{ marginTop: '6px' }}>
                  <span className="sess-lbl">Materiały:</span>{' '}
                  <a href={z.link_materialow} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--brand)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px', fontSize: '12px' }}>
                    Otwórz link →
                  </a>
                </div>
              )}
            </div>
            {wyslano && !rozwinięte && (
              <div style={{ padding: '0 14px 12px' }}>
                <div style={{ background: '#f0faf4', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Twoja praca</p>
                  <a href={odp!.link_pracy} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                    {odp!.link_pracy}
                  </a>
                  {odp!.komentarz && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{odp!.komentarz}</p>}
                </div>
                <button onClick={() => { setAktywneZadanie(z); setLinkPracy(odp!.link_pracy); setKomentarz(odp!.komentarz || ''); }}
                  style={{ marginTop: '8px', fontSize: '12px', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  Edytuj odpowiedź
                </button>
              </div>
            )}
            {rozwinięte && (
              <div style={{ padding: '0 14px 14px' }}>
                <div className="login-field" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px' }}>Link do pracy (Google Drive, Dropbox...)</label>
                  <input type="url" value={linkPracy} onChange={e => setLinkPracy(e.target.value)} placeholder="https://drive.google.com/..." style={{ fontSize: '13px' }} />
                </div>
                <div className="login-field" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px' }}>Komentarz (opcjonalnie)</label>
                  <textarea value={komentarz} onChange={e => setKomentarz(e.target.value)} rows={2} placeholder="np. wersja robocza, czeka na poprawki..." style={{ fontSize: '13px', resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => wyslij(z)} disabled={wysylanie || !linkPracy.trim()} className="login-btn" style={{ flex: 1, marginTop: 0, padding: '10px' }}>
                    {wysylanie ? 'Wysyłanie...' : 'Prześlij pracę'}
                  </button>
                  <button onClick={() => { setAktywneZadanie(null); setLinkPracy(''); setKomentarz(''); }}
                    style={{ padding: '10px 16px', borderRadius: '12px', border: '0.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Anuluj
                  </button>
                </div>
              </div>
            )}
            {!wyslano && !rozwinięte && (
              <div style={{ padding: '0 14px 14px' }}>
                <button onClick={() => setAktywneZadanie(z)} className="login-btn" style={{ width: '100%', marginTop: 0, padding: '10px' }}>
                  Prześlij pracę
                </button>
              </div>
            )}
            {sukces === z.id && (
              <div style={{ padding: '0 14px 12px', fontSize: '13px', color: '#2e7d32' }}>✓ Praca przesłana!</div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── EKRAN OBECNOŚCI (kursant) ───────────────────────────────────────────────

function EkranObecnosc({ user, kursant, zjazdy }: { user: User; kursant: Kursant | null; zjazdy: Zjazd[] }) {
  const [obecnosci, setObecnosci] = useState<Obecnosc[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [wysylanie, setWysylanie] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    pobierzObecnosci();
  }, [user]);

  async function pobierzObecnosci() {
    setLadowanie(true);
    const { data } = await supabase
      .from('obecnosci')
      .select('*')
      .eq('user_id', user.id);
    setObecnosci(data || []);
    setLadowanie(false);
  }

  async function potwierdz(zjazd: Zjazd) {
    if (!kursant) return;
    setWysylanie(zjazd.id);
    const { error } = await supabase.from('obecnosci').insert([{
      zjazd_id: zjazd.id,
      user_id: user.id,
      grupa_id: kursant.grupa_id,
      imie: kursant.imie,
      nazwisko: kursant.nazwisko,
    }]);
    if (!error) await pobierzObecnosci();
    setWysylanie(null);
  }

  async function odwolaj(zjazd: Zjazd) {
    setWysylanie(zjazd.id);
    const { error } = await supabase
      .from('obecnosci')
      .delete()
      .eq('zjazd_id', zjazd.id)
      .eq('user_id', user.id);
    if (!error) await pobierzObecnosci();
    setWysylanie(null);
  }

  const czyPotwierdzony = (zjazdId: number) =>
    obecnosci.some(o => o.zjazd_id === zjazdId);

  if (!kursant?.grupa_id) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Nie jesteś przypisany do żadnej grupy.
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">Moja obecność</h2>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
        Potwierdź swoją obecność przed każdym zjazdem.
      </p>

      {ladowanie ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Ładowanie...</div>
      ) : (
        zjazdy.map(z => {
          const potwierdzono = czyPotwierdzony(z.id);
          const trwa = wysylanie === z.id;
          const zakonczone = z.status === 'zakonczony';

          return (
            <div key={z.id} className="sess-card" style={{
              borderColor: potwierdzono ? '#7aab8a' : undefined,
              opacity: zakonczone && !potwierdzono ? 0.5 : 1,
            }}>
              <div className="sess-top" style={{
                background: potwierdzono ? '#f0faf4' : zakonczone ? undefined : 'var(--brand-light)',
              }}>
                <span className="sess-nr">Zjazd {z.nr}</span>
                {potwierdzono ? (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    ✓ Potwierdzono
                  </span>
                ) : (
                  <span className={`s-badge s-${z.status}`}>
                    {z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}
                  </span>
                )}
              </div>
              <div className="sess-date">{z.daty}</div>
              <div className="sess-rows">
                <div className="sess-row">{z.sala}</div>
                <div className="sess-row">{z.adres}</div>
              </div>

              {/* Przycisk — tylko dla nadchodzących */}
              {!zakonczone && (
                <div style={{ padding: '0 14px 14px' }}>
                  {potwierdzono ? (
                    <button
                      onClick={() => odwolaj(z)}
                      disabled={trwa}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '0.5px solid #c8e6c9', background: 'white',
                        color: '#2e7d32', fontSize: '13px', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      {trwa ? 'Cofanie...' : 'Cofnij potwierdzenie'}
                    </button>
                  ) : (
                    <button
                      onClick={() => potwierdz(z)}
                      disabled={trwa}
                      className="login-btn"
                      style={{ marginTop: 0 }}
                    >
                      {trwa ? 'Potwierdzanie...' : 'Potwierdzam obecność'}
                    </button>
                  )}
                </div>
              )}

              {/* Zakończony i potwierdzony — znaczek */}
              {zakonczone && potwierdzono && (
                <div style={{ padding: '0 14px 12px', fontSize: '12px', color: '#2e7d32' }}>
                  ✓ Byłeś/aś obecny/a
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

// ─── PANEL BIURA — zakładka OBECNOŚCI ────────────────────────────────────────

function AdminObecnosci({ grupy, zjazdy }: { grupy: Grupa[]; zjazdy: Zjazd[] }) {
  const [wybranaGrupa, setWybranaGrupa] = useState('');
  const [wybranyZjazd, setWybranyZjazd] = useState('');
  const [lista, setLista] = useState<Obecnosc[]>([]);
  const [ladowanie, setLadowanie] = useState(false);

  const zjazdyGrupy = wybranaGrupa
    ? zjazdy.filter(z => z.grupa_id === parseInt(wybranaGrupa))
    : [];

  useEffect(() => {
    if (!wybranyZjazd) { setLista([]); return; }
    setLadowanie(true);
    supabase
      .from('obecnosci')
      .select('*')
      .eq('zjazd_id', parseInt(wybranyZjazd))
      .order('nazwisko', { ascending: true })
      .then(({ data }) => { setLista(data || []); setLadowanie(false); });
  }, [wybranyZjazd]);

  function eksportujCSV() {
    const zjazd = zjazdy.find(z => z.id === parseInt(wybranyZjazd));
    const naglowki = ['imie', 'nazwisko', 'confirmed_at'];
    const wiersze = lista.map(o => [
      `"${o.imie}"`,
      `"${o.nazwisko}"`,
      `"${new Date(o.confirmed_at).toLocaleString('pl-PL')}"`,
    ].join(','));
    const csv = [naglowki.join(','), ...wiersze].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obecnosc_zjazd${zjazd?.nr || ''}.csv`;
    a.click();
  }

  return (
    <>
      <h2 className="page-title">Lista obecności</h2>

      <div className="login-field" style={{ marginBottom: '10px' }}>
        <label>Grupa</label>
        <select value={wybranaGrupa} onChange={e => { setWybranaGrupa(e.target.value); setWybranyZjazd(''); setLista([]); }}>
          <option value="">Wybierz grupę</option>
          {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
        </select>
      </div>

      {wybranaGrupa && (
        <div className="login-field" style={{ marginBottom: '16px' }}>
          <label>Zjazd</label>
          <select value={wybranyZjazd} onChange={e => setWybranyZjazd(e.target.value)}>
            <option value="">Wybierz zjazd</option>
            {zjazdyGrupy.map(z => (
              <option key={z.id} value={z.id}>Zjazd {z.nr} — {z.daty}</option>
            ))}
          </select>
        </div>
      )}

      {wybranyZjazd && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {ladowanie ? 'Ładowanie...' : `${lista.length} potwierdzeń`}
            </span>
            {lista.length > 0 && (
              <button
                onClick={eksportujCSV}
                style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
              >
                ⬇ Eksportuj CSV
              </button>
            )}
          </div>

          {!ladowanie && lista.length === 0 && (
            <div className="profil-card">
              <div className="profil-row">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Brak potwierdzeń dla tego zjazdu.</span>
              </div>
            </div>
          )}

          {lista.length > 0 && (
            <div className="profil-card">
              {lista.map((o, i) => (
                <div key={o.id} className="profil-row">
                  <span className="profil-lbl" style={{ fontWeight: 500, color: 'var(--text)' }}>
                    {i + 1}. {o.imie} {o.nazwisko}
                  </span>
                  <span className="profil-val" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(o.confirmed_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

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

  const pokazUzasadnienie = [
    odpowiedzi.org_czas, odpowiedzi.org_miejsce, odpowiedzi.org_baza,
    odpowiedzi.org_materialy, odpowiedzi.org_kadra, odpowiedzi.org_dostosowanie,
  ].some(v => v > 0 && v <= 2);

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
          <div style={{ marginTop: '20px', background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '0.5px solid var(--border)' }}>
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
        <div style={{ marginTop: '24px', background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '0.5px solid var(--border)' }}>
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
                  <button key={opcja} type="button" onClick={() => ustaw('wiedza_wzrosla', opcja)} style={{
                    flex: 1, padding: '10px 4px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer',
                    fontWeight: odpowiedzi.wiedza_wzrosla === opcja ? '600' : '400',
                    background: odpowiedzi.wiedza_wzrosla === opcja ? '#A05C5C' : 'var(--surface)',
                    color: odpowiedzi.wiedza_wzrosla === opcja ? 'white' : 'var(--text)',
                    border: odpowiedzi.wiedza_wzrosla === opcja ? 'none' : '0.5px solid var(--border)',
                    transition: 'all 0.15s',
                  }}>{opcja}</button>
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
                5b. Miejsce szkolenia <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>(nie dotyczy kursu online)</span>
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
                  <button key={opcja} type="button" onClick={() => ustaw('nps', opcja)} style={{
                    flex: 1, padding: '10px 4px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer',
                    fontWeight: odpowiedzi.nps === opcja ? '600' : '400',
                    background: odpowiedzi.nps === opcja ? (opcja === 'Tak' ? '#4a7c59' : opcja === 'Nie' ? '#A05C5C' : '#7a6a3a') : 'var(--surface)',
                    color: odpowiedzi.nps === opcja ? 'white' : 'var(--text)',
                    border: odpowiedzi.nps === opcja ? 'none' : '0.5px solid var(--border)',
                    transition: 'all 0.15s',
                  }}>{opcja}</button>
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
            <button onClick={() => setKrok(k => k - 1)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '0.5px solid var(--brand)', background: 'white', color: 'var(--brand)', fontSize: '15px', cursor: 'pointer', fontWeight: '600' }}>← Wstecz</button>
          )}
          {krok < krokowLacznie ? (
            <button onClick={() => setKrok(k => k + 1)} className="login-btn" style={{ flex: 1 }}>Dalej →</button>
          ) : (
            <button onClick={wyslij} className="login-btn" style={{ flex: 1 }} disabled={wysylanie}>{wysylanie ? 'Wysyłanie...' : 'Wyślij ankietę ✓'}</button>
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
    setLadowanie(true); setBlad('');
    const { error } = await supabase.auth.updateUser({ password: haslo });
    if (error) { setBlad('Blad zmiany hasla. Sprobuj ponownie.'); } else { setSukces(true); }
    setLadowanie(false);
  }

  if (sukces) return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo">On<span>-Arch</span></div>
      <div className="reset-success"><div className="reset-icon">✅</div><h3>Haslo zostalo zmienione!</h3><p>Mozesz teraz zalogowac sie nowym haslem.</p></div>
      <button className="login-btn" style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>Przejdz do logowania</button>
    </div></div>
  );

  return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo">On<span>-Arch</span></div>
      <p className="login-sub">Ustaw nowe haslo</p>
      <form className="login-form" onSubmit={zmienHaslo}>
        <div className="login-field"><label>Nowe haslo</label><input type="password" value={haslo} onChange={e => setHaslo(e.target.value)} placeholder="password" required /></div>
        <div className="login-field"><label>Powtorz haslo</label><input type="password" value={haslo2} onChange={e => setHaslo2(e.target.value)} placeholder="password" required /></div>
        {blad && <div className="login-error">{blad}</div>}
        <button className="login-btn" type="submit" disabled={ladowanie}>{ladowanie ? 'Zapisywanie...' : 'Ustaw haslo'}</button>
      </form>
    </div></div>
  );
}

function EkranPolitykaPrywatnosci({ onWroc }: { onWroc: () => void }) {
  return (
    <div className="login-screen" style={{ overflowY: 'auto', alignItems: 'flex-start', padding: '24px' }}>
      <button className="btn-wroc" onClick={onWroc} style={{ marginBottom: '16px' }}>← Wróć</button>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', marginBottom: '16px' }}>Polityka Prywatności</h2>
      <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text)' }}>
        <p style={{ marginBottom: '12px' }}><strong>Administrator danych osobowych:</strong><br />On-Arch Barbara Szczęsna-Dyńska<br />ul. Tymienieckiego 25D/53, 90-350 Łódź<br />Email: biuro@on-arch.pl</p>
        <p style={{ marginBottom: '8px' }}><strong>1. Jakie dane zbieramy?</strong></p>
        <p style={{ marginBottom: '12px' }}>Imię i nazwisko, adres e-mail, numer telefonu, zdjęcie profilowe (opcjonalne).</p>
        <p style={{ marginBottom: '8px' }}><strong>2. W jakim celu?</strong></p>
        <p style={{ marginBottom: '12px' }}>Dane są przetwarzane wyłącznie w celu umożliwienia korzystania z aplikacji On-Arch.</p>
        <p style={{ marginBottom: '8px' }}><strong>3. Podstawa prawna</strong></p>
        <p style={{ marginBottom: '12px' }}>Art. 6 ust. 1 lit. b i a RODO.</p>
        <p style={{ marginBottom: '8px' }}><strong>4. Jak długo przechowujemy dane?</strong></p>
        <p style={{ marginBottom: '12px' }}>Przez czas trwania kursu oraz do 12 miesięcy po jego zakończeniu.</p>
        <p style={{ marginBottom: '8px' }}><strong>5. Twoje prawa</strong></p>
        <p style={{ marginBottom: '12px' }}>Dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, skarga do UODO.</p>
        <p style={{ marginBottom: '8px' }}><strong>6. Kontakt</strong></p>
        <p>biuro@on-arch.pl | 883 659 069</p>
      </div>
    </div>
  );
}

function EkranRegulamin({ onWroc }: { onWroc: () => void }) {
  return (
    <div className="login-screen" style={{ overflowY: 'auto', alignItems: 'flex-start', padding: '24px' }}>
      <button className="btn-wroc" onClick={onWroc} style={{ marginBottom: '16px' }}>← Wróć</button>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', marginBottom: '16px' }}>Regulamin aplikacji</h2>
      <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text)' }}>
        <p style={{ marginBottom: '12px' }}><strong>Aplikacja On-Arch</strong> — regulamin korzystania z aplikacji mobilnej dla kursantów.</p>
        <p style={{ marginBottom: '8px' }}><strong>1. Postanowienia ogólne</strong></p>
        <p style={{ marginBottom: '12px' }}>Aplikacja przeznaczona wyłącznie dla kursantów On-Arch. Korzystanie dobrowolne i bezpłatne.</p>
        <p style={{ marginBottom: '8px' }}><strong>2. Konto użytkownika</strong></p>
        <p style={{ marginBottom: '12px' }}>Dostęp wymaga konta założonego przez biuro. Nie udostępniaj danych logowania.</p>
        <p style={{ marginBottom: '8px' }}><strong>3. Czat grupowy</strong></p>
        <p style={{ marginBottom: '12px' }}>Zabrania się treści obraźliwych i niezgodnych z prawem. Biuro może usuwać nieodpowiednie treści.</p>
        <p style={{ marginBottom: '8px' }}><strong>4. Kontakt</strong></p>
        <p>On-Arch Barbara Szczęsna-Dyńska<br />ul. Tymienieckiego 25D/53, 90-350 Łódź<br />biuro@on-arch.pl | 883 659 069</p>
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
    setLadowanie(true); setBlad('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: haslo });
    if (error) { setBlad('Nieprawidlowy email lub haslo'); } else { onZalogowano(); }
    setLadowanie(false);
  }

  async function resetHasla(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true); setBlad('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://on-arch-akademia.vercel.app' });
    if (error) { setBlad('Blad wysylania emaila. Sprawdz adres.'); } else { setResetWyslany(true); }
    setLadowanie(false);
  }

  if (pokazPolityka) return <EkranPolitykaPrywatnosci onWroc={() => setPokazPolityka(false)} />;
  if (pokazRegulamin) return <EkranRegulamin onWroc={() => setPokazRegulamin(false)} />;

  if (resetWyslany) return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo">On<span>-Arch</span></div>
      <div className="reset-success"><div className="reset-icon">✉️</div><h3>Sprawdz skrzynke</h3><p>Wyslalismy link na adres <strong>{email}</strong></p></div>
      <button className="login-btn" style={{ marginTop: '20px' }} onClick={() => { setResetMode(false); setResetWyslany(false); }}>Wroce do logowania</button>
    </div></div>
  );

  if (resetMode) return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo">On<span>-Arch</span></div>
      <p className="login-sub">Resetowanie hasla</p>
      <form className="login-form" onSubmit={resetHasla}>
        <div className="login-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" required /></div>
        {blad && <div className="login-error">{blad}</div>}
        <button className="login-btn" type="submit" disabled={ladowanie}>{ladowanie ? 'Wysylanie...' : 'Wyslij link resetujacy'}</button>
      </form>
      <button className="btn-link" onClick={() => setResetMode(false)}>Wroce do logowania</button>
    </div></div>
  );

  return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo">On<span>-Arch</span></div>
      <p className="login-sub">Panel kursanta</p>
      <form className="login-form" onSubmit={zaloguj}>
        <div className="login-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" required /></div>
        <div className="login-field"><label>Haslo</label><input type="password" value={haslo} onChange={e => setHaslo(e.target.value)} placeholder="password" required /></div>
        {blad && <div className="login-error">{blad}</div>}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0' }}>
          <input type="checkbox" id="zgoda" checked={zgodaRodo} onChange={e => setZgodaRodo(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--brand)' }} />
          <label htmlFor="zgoda" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Akceptuję <button type="button" className="btn-link" style={{ display: 'inline', fontSize: '12px' }} onClick={() => setPokazRegulamin(true)}>Regulamin</button> oraz <button type="button" className="btn-link" style={{ display: 'inline', fontSize: '12px' }} onClick={() => setPokazPolityka(true)}>Politykę Prywatności</button>
          </label>
        </div>
        <button className="login-btn" type="submit" disabled={ladowanie || !zgodaRodo}>{ladowanie ? 'Logowanie...' : 'Zaloguj sie'}</button>
      </form>
      <button className="btn-link" onClick={() => setResetMode(true)}>Nie pamietasz hasla?</button>
      <p className="login-kontakt">Problemy z logowaniem? Zadzwon do biura:<br /><strong>883 659 069</strong></p>
    </div></div>
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
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [kursant?.grupa_id]);

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    if (!nowa.trim() || !kursant) return;
    setWysylanie(true);
    await supabase.from('wiadomosci').insert([{ grupa_id: kursant.grupa_id, user_id: user.id, imie: kursant.imie, tekst: nowa.trim() }]);
    setNowa(''); setWysylanie(false);
  }

  if (!kursant?.grupa_id) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nie jestes przypisany do zadnej grupy.</div>;

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

// ─── PANEL PROWADZĄCEGO ──────────────────────────────────────────────────────

function PanelProwadzacego({ user, kursant, onWyloguj }: { user: User; kursant: Kursant | null; onWyloguj: () => void }) {
  const [aktywnaZakladka, setAktywnaZakladka] = useState('zadania');
  const [mojeProwadzacyId, setMojeProwadzacyId] = useState<number | null>(null);
  const [mojeGrupy, setMojeGrupy] = useState<Grupa[]>([]);
  const [mojeGrupyIds, setMojeGrupyIds] = useState<number[]>([]);
  const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
  const [kursanci, setKursanci] = useState<KursantAdmin[]>([]);
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [zadania, setZadania] = useState<Zadanie[]>([]);
  const [odpowiedziZadan, setOdpowiedziZadan] = useState<ZadanieOdpowiedz[]>([]);
  const [notatki, setNotatki] = useState<Notatka[]>([]);
  const [aktywneOgloszenie, setAktywneOgloszenie] = useState<Ogloszenie | null>(null);
  const [noweZadanie, setNoweZadanie] = useState({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: '', typ: 'zadanie' });
  const [wybranaGrupa, setWybranaGrupa] = useState('');
  const [aktywnaNotatkaKursant, setAktywnaNotatkaKursant] = useState<string | null>(null);
  const [trescNotatki, setTrescNotatki] = useState('');
  const [ladowanie, setLadowanie] = useState(true);

  useEffect(() => {
    pobierz();
  }, [kursant]);

  async function pobierz() {
    setLadowanie(true);

    // 1. Znajdź profil prowadzącego bezpośrednio przez user_id
    const { data: pData } = await supabase
      .from('prowadzacy')
      .select('id, imie, nazwisko, bio, avatar_url')
      .eq('user_id', user.id)
      .single();

    const pid = pData?.id;
    setMojeProwadzacyId(pid || null);

    if (!pid) {
      setLadowanie(false);
      return;
    }

    // 2. Znajdź zjazdy przypisane do tego prowadzącego
    const { data: zpData } = await supabase
      .from('zjazdy_prowadzacy')
      .select('zjazd_id')
      .eq('prowadzacy_id', pid);

    const zjazdIds = (zpData || []).map((r: any) => r.zjazd_id);

    if (zjazdIds.length === 0) {
      setLadowanie(false);
      return;
    }

    // 3. Pobierz te zjazdy i wyciągnij unikalne grupa_id
    const { data: zjData } = await supabase
      .from('zjazdy')
      .select('*')
      .in('id', zjazdIds)
      .order('data_zjazdu', { ascending: true });

    const grupyIds = [...new Set((zjData || []).map((z: any) => z.grupa_id))] as number[];
    setMojeGrupyIds(grupyIds);
    setZjazdy(zjData || []);

    // 4. Pobierz tylko swoje grupy, kursantów, zadania, ogłoszenia
    const [{ data: gr }, { data: ku }, { data: og }, { data: zad }, { data: odp }] = await Promise.all([
      supabase.from('grupy').select('*').in('id', grupyIds),
      supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id').eq('rola', 'kursant').in('grupa_id', grupyIds),
      supabase.from('ogloszenia').select('*').order('data_utworzenia', { ascending: false }),
      supabase.from('zadania').select('*').in('grupa_id', grupyIds).order('created_at', { ascending: false }),
      supabase.from('zadania_odpowiedzi').select('*').order('created_at', { ascending: false }),
    ]);

    setMojeGrupy(gr || []);
    setKursanci(ku as unknown as KursantAdmin[] || []);
    setOgloszenia((og || []).filter((o: any) => o.grupa_id === null || grupyIds.includes(o.grupa_id)));
    setZadania(zad || []);
    setOdpowiedziZadan(odp || []);

    // Pobierz notatki
    if (pid) {
      const { data: not } = await supabase.from('notatki_kursantow').select('*').eq('prowadzacy_id', pid);
      setNotatki(not || []);
    }
    setLadowanie(false);
  }

  async function zapiszNotatke(kursantUserId: string) {
    if (!mojeProwadzacyId || !trescNotatki.trim()) return;
    const istniejaca = notatki.find(n => n.kursant_user_id === kursantUserId);
    if (istniejaca) {
      await supabase.from('notatki_kursantow').update({ tresc: trescNotatki, updated_at: new Date().toISOString() }).eq('id', istniejaca.id);
    } else {
      await supabase.from('notatki_kursantow').insert([{ kursant_user_id: kursantUserId, prowadzacy_id: mojeProwadzacyId, tresc: trescNotatki }]);
    }
    const { data: not } = await supabase.from('notatki_kursantow').select('*').eq('prowadzacy_id', mojeProwadzacyId);
    setNotatki(not || []);
    setAktywnaNotatkaKursant(null);
    setTrescNotatki('');
  }

  async function usunNotatke(kursantUserId: string) {
    const n = notatki.find(n => n.kursant_user_id === kursantUserId);
    if (!n) return;
    await supabase.from('notatki_kursantow').delete().eq('id', n.id);
    setNotatki(prev => prev.filter(x => x.id !== n.id));
    setAktywnaNotatkaKursant(null);
  }

  async function dodajZadanie(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('zadania').insert([{
      grupa_id: parseInt(noweZadanie.grupa_id),
      tytul: noweZadanie.tytul,
      opis: noweZadanie.opis || null,
      termin: noweZadanie.termin || null,
      link_materialow: noweZadanie.link_materialow || null,
      typ: noweZadanie.typ || 'zadanie',
    }]);
    if (error) { setKomunikat('Błąd: ' + error.message); return; }
    setKomunikat('Zadanie dodane!');
    setNoweZadanie({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: noweZadanie.grupa_id, typ: 'zadanie' });
    const { data } = await supabase.from('zadania').select('*').in('grupa_id', mojeGrupyIds).order('created_at', { ascending: false });
    setZadania(data || []);
  }

  async function usunZadanie(id: number) {
    if (!window.confirm('Usunąć zadanie?')) return;
    await supabase.from('zadania').delete().eq('id', id);
    setZadania(prev => prev.filter(z => z.id !== id));
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">On<span>-Arch</span> <span style={{ fontSize: '11px', opacity: 0.7 }}>Prowadzący</span></div>
        <button onClick={onWyloguj} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '13px', cursor: 'pointer' }}>Wyloguj</button>
      </header>
      <main className="main">
        {komunikat && <div className="login-error" style={{ background: '#e8f5e9', color: '#2e7d32', marginBottom: '12px' }}>{komunikat}</div>}

        {ladowanie && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Ładowanie...</div>}

        {!ladowanie && !mojeProwadzacyId && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Twoje konto nie jest powiązane z profilem prowadzącego.<br />
              Skontaktuj się z biurem.
            </p>
          </div>
        )}

        {!ladowanie && mojeProwadzacyId && mojeGrupyIds.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <p style={{ fontSize: '14px' }}>Nie jesteś jeszcze przypisany do żadnego zjazdu.</p>
          </div>
        )}

        {!ladowanie && mojeProwadzacyId && mojeGrupyIds.length > 0 && (
          <>
            {aktywnaZakladka === 'zadania' && (
              <>
                <p className="greeting" style={{ marginBottom: '16px' }}>Dzień dobry, {kursant?.imie || 'Prowadzący'}</p>

                {/* Jeśli wiele grup — pokaż switcher */}
                {mojeGrupy.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <button onClick={() => setWybranaGrupa('')}
                      style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: !wybranaGrupa ? 'var(--brand)' : 'white', color: !wybranaGrupa ? 'white' : 'var(--text)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Jost, sans-serif' }}>
                      Wszystkie
                    </button>
                    {mojeGrupy.map(g => (
                      <button key={g.id} onClick={() => setWybranaGrupa(String(g.id))}
                        style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: wybranaGrupa === String(g.id) ? 'var(--brand)' : 'white', color: wybranaGrupa === String(g.id) ? 'white' : 'var(--text)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Jost, sans-serif' }}>
                        {g.nazwa}
                      </button>
                    ))}
                  </div>
                )}

                <h2 className="page-title">Nowe zadanie</h2>
                <form className="admin-form" onSubmit={dodajZadanie}>
                  <div className="login-field">
                    <label>Grupa</label>
                    <select value={noweZadanie.grupa_id} onChange={e => setNoweZadanie({ ...noweZadanie, grupa_id: e.target.value })} required>
                      <option value="">Wybierz grupę</option>
                      {mojeGrupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                  </div>
                  <div className="login-field"><label>Tytuł zadania</label><input type="text" value={noweZadanie.tytul} onChange={e => setNoweZadanie({ ...noweZadanie, tytul: e.target.value })} placeholder="np. Przygotuj rzut mieszkania" required /></div>
                  <div className="login-field"><label>Opis / instrukcja</label><textarea value={noweZadanie.opis} onChange={e => setNoweZadanie({ ...noweZadanie, opis: e.target.value })} rows={4} placeholder="Co dokładnie należy przygotować..." /></div>
                  <div className="login-field"><label>Termin (opcjonalnie)</label><input type="date" value={noweZadanie.termin} onChange={e => setNoweZadanie({ ...noweZadanie, termin: e.target.value })} /></div>
                  <div className="login-field"><label>Link do materiałów (opcjonalnie)</label><input type="url" value={noweZadanie.link_materialow} onChange={e => setNoweZadanie({ ...noweZadanie, link_materialow: e.target.value })} placeholder="https://drive.google.com/..." /></div>
                  <div className="login-field"><label>Typ</label><select value={noweZadanie.typ} onChange={e => setNoweZadanie({ ...noweZadanie, typ: e.target.value })}><option value="zadanie">Zadanie domowe</option><option value="praca_zaliczeniowa">Praca zaliczeniowa</option></select></div>
                  <button className="login-btn" type="submit">Dodaj zadanie</button>
                </form>

                <h2 className="page-title" style={{ marginTop: '24px' }}>Lista zadań</h2>
                {zadania
                  .filter(z => !wybranaGrupa || z.grupa_id === parseInt(wybranaGrupa))
                  .map(z => {
                    const odp = odpowiedziZadan.filter(o => o.zadanie_id === z.id);
                    return (
                      <div key={z.id} className="profil-card" style={{ marginBottom: '10px' }}>
                        <div className="profil-row">
                          <span className="profil-lbl" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 500 }}>{z.tytul}</span>
                          <button onClick={() => usunZadanie(z.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '18px' }}>×</button>
                        </div>
                        {mojeGrupy.length > 1 && <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{mojeGrupy.find(g => g.id === z.grupa_id)?.nazwa || '-'}</span></div>}
                        {z.termin && <div className="profil-row"><span className="profil-lbl">Termin</span><span className="profil-val">{new Date(z.termin).toLocaleDateString('pl-PL')}</span></div>}
                        {z.link_materialow && (
                          <div className="profil-row"><span className="profil-lbl">Materiały</span>
                            <a href={z.link_materialow} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand)' }}>Otwórz →</a>
                          </div>
                        )}
                        {odp.length > 0 ? (
                          <div style={{ margin: '8px 16px 12px', background: '#f8f8f8', borderRadius: '10px', padding: '10px 12px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>Przesłane prace ({odp.length})</p>
                            {odp.map(o => (
                              <div key={o.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)' }}>
                                <p style={{ fontSize: '13px', fontWeight: 500 }}>{o.imie} {o.nazwisko}</p>
                                <a href={o.link_pracy} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline', wordBreak: 'break-all' }}>{o.link_pracy}</a>
                                {o.komentarz && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{o.komentarz}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '0 16px 12px' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Brak przesłanych prac</span></div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}

            {aktywnaZakladka === 'kursanci' && (
              <>
                <h2 className="page-title">Kursanci</h2>
                {mojeGrupy.map(g => (
                  <div key={g.id} style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--brand)', marginBottom: '10px' }}>{g.nazwa}</h3>
                    {kursanci.filter(k => k.grupa_id === g.id).map(k => {
                      const notatka = notatki.find(n => n.kursant_user_id === k.user_id);
                      const otwarta = aktywnaNotatkaKursant === k.user_id;
                      return (
                        <div key={k.id} className="profil-card" style={{ marginBottom: '8px' }}>
                          <div className="profil-row" style={{ cursor: 'pointer' }} onClick={() => {
                            if (otwarta) { setAktywnaNotatkaKursant(null); setTrescNotatki(''); }
                            else { setAktywnaNotatkaKursant(k.user_id); setTrescNotatki(notatka?.tresc || ''); }
                          }}>
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{k.imie} {k.nazwisko}</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {notatka && <span style={{ fontSize: '10px', background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '10px' }}>Notatka</span>}
                              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{otwarta ? '▲' : '▼'}</span>
                            </div>
                          </div>
                          {otwarta && (
                            <div style={{ padding: '0 16px 14px' }}>
                              {notatka && !trescNotatki && (
                                <div style={{ background: '#faf6f3', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                  {notatka.tresc}
                                </div>
                              )}
                              <textarea
                                value={trescNotatki}
                                onChange={e => setTrescNotatki(e.target.value)}
                                placeholder="Notatka prywatna (widoczna tylko dla Ciebie)..."
                                rows={3}
                                style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '10px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', resize: 'none', background: 'white' }}
                              />
                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button onClick={() => zapiszNotatke(k.user_id)} disabled={!trescNotatki.trim()}
                                  className="login-btn" style={{ flex: 1, marginTop: 0, padding: '9px' }}>
                                  Zapisz notatkę
                                </button>
                                {notatka && (
                                  <button onClick={() => usunNotatke(k.user_id)}
                                    style={{ padding: '9px 14px', borderRadius: '10px', border: '0.5px solid #fcc', background: 'white', color: '#c62828', cursor: 'pointer', fontSize: '12px', fontFamily: 'Jost, sans-serif' }}>
                                    Usuń
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {kursanci.filter(k => k.grupa_id === g.id).length === 0 && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Brak kursantów w tej grupie.</p>
                    )}
                  </div>
                ))}
              </>
            )}

            {aktywnaZakladka === 'zjazdy' && (
              <>
                <h2 className="page-title">Moje zjazdy</h2>
                {mojeGrupy.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <button onClick={() => setWybranaGrupa('')}
                      style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: !wybranaGrupa ? 'var(--brand)' : 'white', color: !wybranaGrupa ? 'white' : 'var(--text)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Jost, sans-serif' }}>
                      Wszystkie
                    </button>
                    {mojeGrupy.map(g => (
                      <button key={g.id} onClick={() => setWybranaGrupa(String(g.id))}
                        style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: wybranaGrupa === String(g.id) ? 'var(--brand)' : 'white', color: wybranaGrupa === String(g.id) ? 'white' : 'var(--text)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Jost, sans-serif' }}>
                        {g.nazwa}
                      </button>
                    ))}
                  </div>
                )}
                {zjazdy
                  .filter(z => !wybranaGrupa || z.grupa_id === parseInt(wybranaGrupa))
                  .map(z => (
                    <div key={z.id} className={`sess-card ${z.status}`}>
                      <div className="sess-top">
                        <span className="sess-nr">Zjazd {z.nr}</span>
                        <span className={`s-badge s-${z.status}`}>{z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}</span>
                      </div>
                      <div className="sess-date">{z.daty}</div>
                      <div className="sess-rows">
                        {mojeGrupy.length > 1 && <div className="sess-row"><span className="sess-lbl">Grupa:</span> {mojeGrupy.find(g => g.id === z.grupa_id)?.nazwa || '-'}</div>}
                        {z.sala && z.sala !== 'Do uzupełnienia' && <div className="sess-row"><span className="sess-lbl">Sala:</span> {z.sala}</div>}
                        {z.adres && z.adres !== 'Do uzupełnienia' && <div className="sess-row"><span className="sess-lbl">Adres:</span> {z.adres}</div>}
                        {z.tematy && <div className="sess-row"><span className="sess-lbl">Temat:</span> {z.tematy}</div>}
                      </div>
                    </div>
                  ))}
              </>
            )}

            {aktywnaZakladka === 'ogloszenia' && (
              <>
                {aktywneOgloszenie ? (
                  <EkranSzczegoly o={aktywneOgloszenie} onWroc={() => setAktywneOgloszenie(null)} />
                ) : (
                  <>
                    <h2 className="page-title">Ogłoszenia</h2>
                    {ogloszenia.map(o => <KartaOgloszenia key={o.id} o={o} onClick={() => setAktywneOgloszenie(o)} />)}
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${aktywnaZakladka === 'zadania' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('zadania')}><BookOpen size={20} /><span className="nav-label">Zadania</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('zjazdy')}><Calendar size={20} /><span className="nav-label">Zjazdy</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'kursanci' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('kursanci')}><User size={20} /><span className="nav-label">Kursanci</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('ogloszenia')}><Bell size={20} /><span className="nav-label">Ogłoszenia</span></button>
      </nav>
    </div>
  );
}

function PanelBiura({ onWyloguj }: { onWyloguj: () => void }) {
  const [aktywnaZakladka, setAktywnaZakladka] = useState('ogloszenia');
  const [grupy, setGrupy] = useState<Grupa[]>([]);
  const [kursanci, setKursanci] = useState<KursantAdmin[]>([]);
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
  const [prowadzacy, setProwadzacy] = useState<Prowadzacy[]>([]);
  const [ankiety, setAnkiety] = useState<OdpowiedziAnkiety[]>([]);
  const [zadania, setZadania] = useState<Zadanie[]>([]);
  const [odpowiedziZadan, setOdpowiedziZadan] = useState<ZadanieOdpowiedz[]>([]);
  const [edytowane, setEdytowane] = useState<Ogloszenie | null>(null);
  const [edytowanyZjazd, setEdytowanyZjazd] = useState<Zjazd | null>(null);
  const [noweOgl, setNoweOgl] = useState({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true, grupa_id: '' });
  const [nowyZjazd, setNowyZjazd] = useState({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '', prowadzacy_id: '' });
  const [nowyKursant, setNowyKursant] = useState({ imie: '', nazwisko: '', email: '', grupa_id: '' });
  const [nowaGrupa, setNowaGrupa] = useState({ nazwa: '', miasto: '', edycja: '', drive_link: '' });
  const [nowyProwadzacy, setNowyProwadzacy] = useState({ imie: '', nazwisko: '', specjalizacja: '' });
  const [noweZadanie, setNoweZadanie] = useState({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: '', typ: 'zadanie' });
  const [komunikat, setKomunikat] = useState('');
  const [importStatus, setImportStatus] = useState<{ imie: string; nazwisko: string; email: string; status: string }[]>([]);
  const [importowanie, setImportowanie] = useState(false);
  const [wybranaGrupaAnkiety, setWybranaGrupaAnkiety] = useState('');
  const [wybranaGrupaZadan, setWybranaGrupaZadan] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pobierzGrupy(); pobierzOgloszenia(); pobierzZjazdy(); pobierzProwadzacy(); pobierzZadania();
    supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id').then(({ data }) => setKursanci((data || []) as unknown as KursantAdmin[]));
    supabase.from('ankiety').select('*').order('created_at', { ascending: false }).then(({ data }) => setAnkiety((data || []) as unknown as OdpowiedziAnkiety[]));
    supabase.from('zadania_odpowiedzi').select('*').order('created_at', { ascending: false }).then(({ data }) => setOdpowiedziZadan(data || []));
  }, []);

  async function pobierzGrupy() { const { data } = await supabase.from('grupy').select('*'); setGrupy(data || []); }
  async function pobierzOgloszenia() { const { data } = await supabase.from('ogloszenia').select('*').order('data_utworzenia', { ascending: false }); setOgloszenia(data || []); }
  async function pobierzZadania() { const { data } = await supabase.from('zadania').select('*').order('created_at', { ascending: false }); setZadania(data || []); }
  async function pobierzZjazdy() {
    const { data: zjData } = await supabase.from('zjazdy').select('*').order('data_zjazdu', { ascending: true });
    if (!zjData) { setZjazdy([]); return; }
    const ids = zjData.map((z: any) => z.id);
    const { data: zpData } = await supabase.from('zjazdy_prowadzacy').select('zjazd_id, prowadzacy(id, imie, nazwisko, bio, avatar_url)').in('zjazd_id', ids);
    const map: Record<number, Prowadzacy[]> = {};
    (zpData || []).forEach((row: any) => {
      if (!map[row.zjazd_id]) map[row.zjazd_id] = [];
      if (row.prowadzacy) map[row.zjazd_id].push(row.prowadzacy);
    });
    setZjazdy(zjData.map((z: any) => ({ ...z, prowadzacy: map[z.id] || [] })));
  }
  async function pobierzProwadzacy() { const { data } = await supabase.from('prowadzacy').select('*').order('nazwisko', { ascending: true }); setProwadzacy(data || []); }

  async function dodajOgloszenie(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('ogloszenia').insert([{ typ: noweOgl.typ, tytul: noweOgl.tytul, tresc: noweOgl.tresc, szczegoly: noweOgl.szczegoly, nowe: true, data_utworzenia: new Date().toISOString(), grupa_id: noweOgl.grupa_id ? parseInt(noweOgl.grupa_id) : null }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Ogloszenie dodane!'); setNoweOgl({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true, grupa_id: '' }); pobierzOgloszenia(); }
  }

  async function zapiszEdycje(e: React.FormEvent) {
    e.preventDefault();
    if (!edytowane) return;
    const { error } = await supabase.from('ogloszenia').update({ typ: edytowane.typ, tytul: edytowane.tytul, tresc: edytowane.tresc, szczegoly: edytowane.szczegoly, grupa_id: edytowane.grupa_id ?? null }).eq('id', edytowane.id);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Zaktualizowane!'); setEdytowane(null); pobierzOgloszenia(); }
  }

  async function usunOgloszenie(id: string) {
    if (!window.confirm('Usunac?')) return;
    const { error } = await supabase.from('ogloszenia').delete().eq('id', id);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Usuniete!'); pobierzOgloszenia(); }
  }

  async function dodajZjazd(e: React.FormEvent) {
    e.preventDefault();
    const { data: nowyZjazdData, error } = await supabase.from('zjazdy').insert([{
      nr: parseInt(nowyZjazd.nr),
      daty: nowyZjazd.daty,
      sala: nowyZjazd.sala,
      adres: nowyZjazd.adres,
      tematy: nowyZjazd.tematy,
      status: nowyZjazd.status,
      data_zjazdu: nowyZjazd.data_zjazdu,
      grupa_id: parseInt(nowyZjazd.grupa_id),
    }]).select().single();
    if (error) { setKomunikat('Blad: ' + error.message); return; }
    if (nowyZjazd.prowadzacy_id && nowyZjazdData) {
      await supabase.from('zjazdy_prowadzacy').insert([{ zjazd_id: nowyZjazdData.id, prowadzacy_id: parseInt(nowyZjazd.prowadzacy_id) }]);
    }
    setKomunikat('Zjazd dodany!');
    setNowyZjazd({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', data_zjazdu: '', grupa_id: '', prowadzacy_id: '' });
    pobierzZjazdy();
  }

  async function zapiszEdycjeZjazdu(e: React.FormEvent) {
    e.preventDefault();
    if (!edytowanyZjazd) return;
    const poprzedniStatus = zjazdy.find(z => z.id === edytowanyZjazd.id)?.status;
    const { error } = await supabase.from('zjazdy').update({
      nr: edytowanyZjazd.nr,
      daty: edytowanyZjazd.daty,
      sala: edytowanyZjazd.sala,
      adres: edytowanyZjazd.adres,
      tematy: edytowanyZjazd.tematy,
      status: edytowanyZjazd.status,
      data_zjazdu: edytowanyZjazd.data_zjazdu,
      grupa_id: edytowanyZjazd.grupa_id,
    }).eq('id', edytowanyZjazd.id);
    if (error) { setKomunikat('Blad: ' + error.message); return; }
    if (edytowanyZjazd.status === 'zakonczony' && poprzedniStatus !== 'zakonczony') {
      const { data: wszystkieZjazdy } = await supabase.from('zjazdy').select('*').eq('grupa_id', edytowanyZjazd.grupa_id).order('data_zjazdu', { ascending: true });
      const jeszczeNadchodzace = (wszystkieZjazdy || []).filter(z => z.id !== edytowanyZjazd.id && z.status === 'nadchodzacy');
      if (jeszczeNadchodzace.length === 0) {
        const nazwaGrupy = grupy.find(g => g.id === edytowanyZjazd.grupa_id)?.nazwa || 'Twoja grupa';
        await supabase.from('ogloszenia').insert([{ typ: 'Informacja', tytul: 'Wypełnij ankietę oceny kursu ⭐', tresc: 'Twój kurs dobiegł końca. Prosimy o wypełnienie krótkiej ankiety — to tylko kilka minut!', szczegoly: `Dziękujemy za udział w kursie ${nazwaGrupy}!\n\nProsimy o wypełnienie krótkiej ankiety. Znajdziesz ją w zakładce ⭐ Ankieta.\n\nZ góry dziękujemy!\nZespół On-Arch`, nowe: true, data_utworzenia: new Date().toISOString() }]);
        setKomunikat('Zjazd zakończony! Kursanci zobaczą powiadomienie o ankiecie.');
      } else { setKomunikat('Zjazd zaktualizowany!'); }
    } else { setKomunikat('Zjazd zaktualizowany!'); }
    setEdytowanyZjazd(null); pobierzZjazdy();
  }

  async function dodajProwadzacego(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('prowadzacy').insert([{
      imie: nowyProwadzacy.imie,
      nazwisko: nowyProwadzacy.nazwisko,
    }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Prowadzący dodany!'); setNowyProwadzacy({ imie: '', nazwisko: '', specjalizacja: '' }); pobierzProwadzacy(); }
  }

  async function usunProwadzacego(id: number) {
    if (!window.confirm('Usunac prowadzacego?')) return;
    const { error } = await supabase.from('prowadzacy').delete().eq('id', id);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Usunieto!'); pobierzProwadzacy(); }
  }

  async function usunZjazd(id: number) {
    if (!window.confirm('Usunac?')) return;
    const { error } = await supabase.from('zjazdy').delete().eq('id', id);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Usunieto!'); pobierzZjazdy(); }
  }

  async function dodajKursanta(e: React.FormEvent) {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: nowyKursant.email, password: Math.random().toString(36).slice(-10) });
    if (authError) { setKomunikat('Blad: ' + authError.message); return; }
    const { error } = await supabase.from('kursanci').insert([{ imie: nowyKursant.imie, nazwisko: nowyKursant.nazwisko, grupa_id: parseInt(nowyKursant.grupa_id), user_id: authData.user!.id, rola: 'kursant' }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Kursant dodany!'); setNowyKursant({ imie: '', nazwisko: '', email: '', grupa_id: '' }); const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id'); setKursanci((data || []) as unknown as KursantAdmin[]); }
  }

  async function dodajGrupe(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('grupy').insert([{ nazwa: nowaGrupa.nazwa, miasto: nowaGrupa.miasto, edycja: nowaGrupa.edycja, drive_link: nowaGrupa.drive_link || null }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Grupa dodana!'); setNowaGrupa({ nazwa: '', miasto: '', edycja: '', drive_link: '' }); pobierzGrupy(); }
  }

  async function zapiszDriveLink(grupaId: number, link: string) {
    const { error } = await supabase.from('grupy').update({ drive_link: link || null }).eq('id', grupaId);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Link zapisany!'); pobierzGrupy(); }
  }

  async function dodajZadanie(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('zadania').insert([{
      grupa_id: parseInt(noweZadanie.grupa_id),
      tytul: noweZadanie.tytul,
      opis: noweZadanie.opis || null,
      termin: noweZadanie.termin || null,
      link_materialow: noweZadanie.link_materialow || null,
      typ: noweZadanie.typ || 'zadanie',
    }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else {
      setKomunikat('Zadanie dodane!');
      setNoweZadanie({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: noweZadanie.grupa_id, typ: 'zadanie' });
      pobierzZadania();
    }
  }

  async function usunZadanie(id: number) {
    if (!window.confirm('Usunąć zadanie?')) return;
    await supabase.from('zadania').delete().eq('id', id);
    setKomunikat('Usunięto!'); pobierzZadania();
  }

  async function importujCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setImportowanie(true); setImportStatus([]);
    const text = await file.text();
    const rows = text.trim().split('\n').slice(1);
    const wyniki: { imie: string; nazwisko: string; email: string; status: string }[] = [];
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
    const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, grupa_id, user_id'); setKursanci((data || []) as unknown as KursantAdmin[]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function eksportujAnkietyCSV() {
    const filtred = wybranaGrupaAnkiety ? ankiety.filter((a: any) => a.grupa_id === parseInt(wybranaGrupaAnkiety)) : ankiety;
    const naglowki = ['data', 'grupa_id', 'zadowolenie', 'wiedza_wzrosla', 'zajecia_teoretyczne', 'zajecia_rysunek', 'zajecia_programy', 'zakres_tematyczny', 'org_czas', 'org_miejsce', 'org_baza', 'org_materialy', 'org_kadra', 'org_dostosowanie', 'stopien_oczekiwan', 'ocena_ogolna', 'nps', 'przydatne_informacje', 'uzasadnienie_zle', 'inne_uwagi', 'plec', 'wyksztalcenie', 'wiek'];
    const wiersze = filtred.map((a: any) => naglowki.map(k => `"${(a[k] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [naglowki.join(','), ...wiersze].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ankiety_onarch.csv'; a.click();
  }

  function srednia(pole: keyof OdpowiedziAnkiety, lista: OdpowiedziAnkiety[]) {
    const vals = lista.map(a => a[pole] as number).filter(v => v > 0);
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }

  const ankietyFiltrowane = wybranaGrupaAnkiety ? ankiety.filter((a: any) => a.grupa_id === parseInt(wybranaGrupaAnkiety)) : ankiety;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">On<span>-Arch</span> <span style={{ fontSize: '11px', opacity: 0.7 }}>Biuro</span></div>
        <button onClick={onWyloguj} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '13px', cursor: 'pointer' }}>Wyloguj</button>
      </header>
      <main className="main">
        {komunikat && <div className="login-error" style={{ background: '#e8f5e9', color: '#2e7d32', marginBottom: '12px' }}>{komunikat}</div>}

        {aktywnaZakladka === 'ogloszenia' && (
          <>
            {edytowane ? (
              <>
                <h2 className="page-title">Edytuj ogloszenie</h2>
                <form className="admin-form" onSubmit={zapiszEdycje}>
                  <div className="login-field"><label>Typ</label><select value={edytowane.typ} onChange={e => setEdytowane({ ...edytowane, typ: e.target.value })}><option>Informacja</option><option>Pilne</option><option>Zmiana</option></select></div>
                  <div className="login-field"><label>Dla kogo</label><select value={edytowane.grupa_id ?? ''} onChange={e => setEdytowane({ ...edytowane, grupa_id: e.target.value ? parseInt(e.target.value) : null })}><option value="">Wszystkie grupy</option>{grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}</select></div>
                  <div className="login-field"><label>Tytul</label><input type="text" value={edytowane.tytul} onChange={e => setEdytowane({ ...edytowane, tytul: e.target.value })} required /></div>
                  <div className="login-field"><label>Krotki opis</label><input type="text" value={edytowane.tresc} onChange={e => setEdytowane({ ...edytowane, tresc: e.target.value })} required /></div>
                  <div className="login-field"><label>Pelna tresc</label><textarea value={edytowane.szczegoly} onChange={e => setEdytowane({ ...edytowane, szczegoly: e.target.value })} rows={4} /></div>
                  <button className="login-btn" type="submit">Zapisz zmiany</button>
                  <button className="btn-link" onClick={() => setEdytowane(null)}>Anuluj</button>
                </form>
              </>
            ) : (
              <>
                <h2 className="page-title">Nowe ogloszenie</h2>
                <form className="admin-form" onSubmit={dodajOgloszenie}>
                  <div className="login-field"><label>Typ</label><select value={noweOgl.typ} onChange={e => setNoweOgl({ ...noweOgl, typ: e.target.value })}><option>Informacja</option><option>Pilne</option><option>Zmiana</option></select></div>
                  <div className="login-field"><label>Dla kogo</label><select value={noweOgl.grupa_id} onChange={e => setNoweOgl({ ...noweOgl, grupa_id: e.target.value })}><option value="">Wszystkie grupy</option>{grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}</select></div>
                  <div className="login-field"><label>Tytul</label><input type="text" value={noweOgl.tytul} onChange={e => setNoweOgl({ ...noweOgl, tytul: e.target.value })} required /></div>
                  <div className="login-field"><label>Krotki opis</label><input type="text" value={noweOgl.tresc} onChange={e => setNoweOgl({ ...noweOgl, tresc: e.target.value })} required /></div>
                  <div className="login-field"><label>Pelna tresc</label><textarea value={noweOgl.szczegoly} onChange={e => setNoweOgl({ ...noweOgl, szczegoly: e.target.value })} rows={4} /></div>
                  <button className="login-btn" type="submit">Dodaj ogloszenie</button>
                </form>
                <h2 className="page-title" style={{ marginTop: '24px' }}>Lista ogloszen</h2>
                {ogloszenia.map(o => (
                  <div key={o.id} className="profil-card" style={{ marginBottom: '8px' }}>
                    <div className="profil-row"><span className="profil-lbl">Tytul</span><span className="profil-val">{o.tytul}</span></div>
                    <div className="profil-row"><span className="profil-lbl">Typ</span><span className="profil-val">{o.typ}</span></div>
                    <div className="profil-row"><span className="profil-lbl">Dla</span><span className="profil-val" style={{ color: o.grupa_id ? 'var(--brand)' : 'var(--text-muted)' }}>{o.grupa_id ? (grupy.find(g => g.id === o.grupa_id)?.nazwa || 'Grupa') : 'Wszystkie grupy'}</span></div>
                    <div style={{ display: 'flex', gap: '8px', margin: '8px 16px 12px' }}>
                      <button className="login-btn" style={{ flex: 1, padding: '8px' }} onClick={() => { setEdytowane(o); setKomunikat(''); }}>Edytuj</button>
                      <button className="btn-wyloguj" style={{ flex: 1, padding: '8px', marginTop: 0 }} onClick={() => usunOgloszenie(o.id)}>Usun</button>
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
                  <div className="login-field"><label>Grupa</label><select value={edytowanyZjazd.grupa_id} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, grupa_id: parseInt(e.target.value) })}>{grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}</select></div>
                  <div className="login-field"><label>Numer zjazdu</label><input type="number" value={edytowanyZjazd.nr} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, nr: parseInt(e.target.value) })} required /></div>
                  <div className="login-field"><label>Daty</label><input type="text" value={edytowanyZjazd.daty} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, daty: e.target.value })} required /></div>
                  <div className="login-field"><label>Data zjazdu</label><input type="date" value={edytowanyZjazd.data_zjazdu} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, data_zjazdu: e.target.value })} required /></div>
                  <div className="login-field"><label>Sala</label><input type="text" value={edytowanyZjazd.sala} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, sala: e.target.value })} required /></div>
                  <div className="login-field"><label>Adres</label><input type="text" value={edytowanyZjazd.adres} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, adres: e.target.value })} required /></div>
                  <div className="login-field"><label>Tematy</label><input type="text" value={edytowanyZjazd.tematy} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, tematy: e.target.value })} required /></div>
                  <div className="login-field"><label>Status</label><select value={edytowanyZjazd.status} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, status: e.target.value })}><option value="nadchodzacy">Nadchodzacy</option><option value="zakonczony">Zakonczony</option></select></div>
                  <button className="login-btn" type="submit">Zapisz zmiany</button>
                  <button className="btn-link" onClick={() => setEdytowanyZjazd(null)}>Anuluj</button>
                </form>
              </>
            ) : (
              <>
                <h2 className="page-title">Nowy zjazd</h2>
                <form className="admin-form" onSubmit={dodajZjazd}>
                  <div className="login-field"><label>Grupa</label><select value={nowyZjazd.grupa_id} onChange={e => setNowyZjazd({ ...nowyZjazd, grupa_id: e.target.value })} required><option value="">Wybierz grupe</option>{grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}</select></div>
                  <div className="login-field"><label>Numer zjazdu</label><input type="number" value={nowyZjazd.nr} onChange={e => setNowyZjazd({ ...nowyZjazd, nr: e.target.value })} required /></div>
                  <div className="login-field"><label>Daty</label><input type="text" value={nowyZjazd.daty} onChange={e => setNowyZjazd({ ...nowyZjazd, daty: e.target.value })} required /></div>
                  <div className="login-field"><label>Data zjazdu</label><input type="date" value={nowyZjazd.data_zjazdu} onChange={e => setNowyZjazd({ ...nowyZjazd, data_zjazdu: e.target.value })} required /></div>
                  <div className="login-field"><label>Sala</label><input type="text" value={nowyZjazd.sala} onChange={e => setNowyZjazd({ ...nowyZjazd, sala: e.target.value })} required /></div>
                  <div className="login-field"><label>Adres</label><input type="text" value={nowyZjazd.adres} onChange={e => setNowyZjazd({ ...nowyZjazd, adres: e.target.value })} required /></div>
                  <div className="login-field"><label>Tematy</label><input type="text" value={nowyZjazd.tematy} onChange={e => setNowyZjazd({ ...nowyZjazd, tematy: e.target.value })} required /></div>
                  <div className="login-field"><label>Prowadzący (opcjonalnie)</label>
                    <select value={nowyZjazd.prowadzacy_id} onChange={e => setNowyZjazd({ ...nowyZjazd, prowadzacy_id: e.target.value })}>
                      <option value="">— brak —</option>
                      {prowadzacy.map(p => <option key={p.id} value={p.id}>{p.imie} {p.nazwisko}</option>)}
                    </select>
                  </div>
                  <div className="login-field"><label>Status</label><select value={nowyZjazd.status} onChange={e => setNowyZjazd({ ...nowyZjazd, status: e.target.value })}><option value="nadchodzacy">Nadchodzacy</option><option value="zakonczony">Zakonczony</option></select></div>
                  <button className="login-btn" type="submit">Dodaj zjazd</button>
                </form>
                <h2 className="page-title" style={{ marginTop: '24px' }}>Lista zjazdów</h2>

                {/* Filtr po grupie */}
                {grupy.length > 1 && (
                  <div className="login-field" style={{ marginBottom: '12px' }}>
                    <label>Filtruj po grupie</label>
                    <select
                      value={(nowyZjazd as any)._filterGrupa || ''}
                      onChange={e => setNowyZjazd({ ...nowyZjazd, ...(nowyZjazd as any), _filterGrupa: e.target.value })}
                    >
                      <option value="">Wszystkie grupy</option>
                      {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                  </div>
                )}

                {zjazdy
                  .filter(z => !(nowyZjazd as any)._filterGrupa || z.grupa_id === parseInt((nowyZjazd as any)._filterGrupa))
                  .map(z => (
                  <div key={z.id} className="profil-card" style={{ marginBottom: '10px' }}>
                    <div className="profil-row">
                      <span className="profil-lbl" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 500 }}>
                        Zjazd {z.nr} — {z.daty}
                      </span>
                      <span className={`s-badge s-${z.status}`} style={{ fontSize: '9px' }}>
                        {z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}
                      </span>
                    </div>
                    <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{grupy.find(g => g.id === z.grupa_id)?.nazwa || '-'}</span></div>

                    {/* Prowadzący inline */}
                    <div className="profil-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                      <span className="profil-lbl">Prowadzący</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%' }}>
                        {(z.prowadzacy || []).map(p => (
                          <span key={p.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'var(--brand-light)', color: 'var(--brand-dark)',
                            fontSize: '12px', padding: '3px 10px 3px 10px', borderRadius: '20px',
                            fontWeight: 500,
                          }}>
                            {p.imie} {p.nazwisko}
                            <button onClick={async () => {
                              await supabase.from('zjazdy_prowadzacy').delete().eq('zjazd_id', z.id).eq('prowadzacy_id', p.id);
                              pobierzZjazdy();
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '14px', padding: '0 0 0 2px', lineHeight: 1 }}>×</button>
                          </span>
                        ))}
                        {/* Dropdown dodawania */}
                        {prowadzacy.filter(p => !(z.prowadzacy || []).some(ep => ep.id === p.id)).length > 0 && (
                          <select
                            defaultValue=""
                            onChange={async (e) => {
                              const pid = parseInt(e.target.value);
                              if (!pid) return;
                              await supabase.from('zjazdy_prowadzacy').insert([{ zjazd_id: z.id, prowadzacy_id: pid }]);
                              e.target.value = '';
                              pobierzZjazdy();
                            }}
                            style={{
                              fontSize: '12px', padding: '3px 8px', borderRadius: '20px',
                              border: '0.5px dashed var(--brand-mid)', background: 'white',
                              color: 'var(--brand)', cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                            }}
                          >
                            <option value="">+ dodaj</option>
                            {prowadzacy
                              .filter(p => !(z.prowadzacy || []).some(ep => ep.id === p.id))
                              .map(p => <option key={p.id} value={p.id}>{p.imie} {p.nazwisko}</option>)
                            }
                          </select>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', margin: '8px 16px 12px' }}>
                      <button className="login-btn" style={{ flex: 1, padding: '8px' }} onClick={() => { setEdytowanyZjazd(z); setKomunikat(''); }}>Edytuj</button>
                      <button className="btn-wyloguj" style={{ flex: 1, padding: '8px', marginTop: 0 }} onClick={() => usunZjazd(z.id)}>Usuń</button>
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
              <div className="login-field"><label>Imie</label><input type="text" value={nowyKursant.imie} onChange={e => setNowyKursant({ ...nowyKursant, imie: e.target.value })} required /></div>
              <div className="login-field"><label>Nazwisko</label><input type="text" value={nowyKursant.nazwisko} onChange={e => setNowyKursant({ ...nowyKursant, nazwisko: e.target.value })} required /></div>
              <div className="login-field"><label>Email</label><input type="email" value={nowyKursant.email} onChange={e => setNowyKursant({ ...nowyKursant, email: e.target.value })} required /></div>
              <div className="login-field"><label>Grupa</label><select value={nowyKursant.grupa_id} onChange={e => setNowyKursant({ ...nowyKursant, grupa_id: e.target.value })} required><option value="">Wybierz grupe</option>{grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}</select></div>
              <button className="login-btn" type="submit">Dodaj kursanta</button>
            </form>
            <h2 className="page-title" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Lista kursantów
              <button onClick={() => {
                const naglowki = ['imie', 'nazwisko', 'grupa'];
                const wiersze = kursanci.map(k => [
                  `"${k.imie}"`, `"${k.nazwisko}"`,
                  `"${grupy.find(g => g.id === k.grupa_id)?.nazwa || ''}"`,
                ].join(','));
                const csv = [naglowki.join(','), ...wiersze].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'kursanci.csv'; a.click();
              }} style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
                ⬇ CSV
              </button>
            </h2>
            {kursanci.map(k => (
              <div key={k.id} className="profil-card" style={{ marginBottom: '8px' }}>
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
              <div className="login-field"><label>Nazwa grupy</label><input type="text" value={nowaGrupa.nazwa} onChange={e => setNowaGrupa({ ...nowaGrupa, nazwa: e.target.value })} required /></div>
              <div className="login-field"><label>Miasto</label><input type="text" value={nowaGrupa.miasto} onChange={e => setNowaGrupa({ ...nowaGrupa, miasto: e.target.value })} required /></div>
              <div className="login-field"><label>Edycja</label><input type="text" value={nowaGrupa.edycja} onChange={e => setNowaGrupa({ ...nowaGrupa, edycja: e.target.value })} required /></div>
              <div className="login-field"><label>Strefa Wiedzy — link Google Drive (opcjonalnie)</label><input type="url" value={nowaGrupa.drive_link} onChange={e => setNowaGrupa({ ...nowaGrupa, drive_link: e.target.value })} placeholder="https://drive.google.com/..." /></div>
              <button className="login-btn" type="submit">Dodaj grupe</button>
            </form>
            <h2 className="page-title" style={{ marginTop: '24px' }}>Lista grup</h2>
            {grupy.map(g => (
              <div key={g.id} className="profil-card" style={{ marginBottom: '8px' }}>
                <div className="profil-row"><span className="profil-lbl">ID do CSV</span><span className="profil-val" style={{ fontWeight: '700', color: 'var(--brand)' }}>{g.id}</span></div>
                <div className="profil-row"><span className="profil-lbl">Nazwa</span><span className="profil-val">{g.nazwa}</span></div>
                <div className="profil-row"><span className="profil-lbl">Miasto</span><span className="profil-val">{g.miasto}</span></div>
                <div className="profil-row"><span className="profil-lbl">Edycja</span><span className="profil-val">{g.edycja}</span></div>
                <div style={{ padding: '4px 16px 12px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>Strefa Wiedzy (Drive)</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="url"
                      defaultValue={g.drive_link || ''}
                      placeholder="https://drive.google.com/..."
                      onBlur={e => { if (e.target.value !== (g.drive_link || '')) zapiszDriveLink(g.id, e.target.value); }}
                      style={{ flex: 1, fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {aktywnaZakladka === 'import' && (
          <>
            <h2 className="page-title">Import kursantow z CSV</h2>
            <div className="profil-card" style={{ marginBottom: '16px' }}>
              <div className="profil-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Format: imie,nazwisko,email,grupa_id</p>
                <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '6px', display: 'block', whiteSpace: 'pre', width: '100%' }}>imie,nazwisko,email,grupa_id{'\n'}Anna,Kowalska,a.k@email.pl,1</code>
              </div>
            </div>
            <div className="login-field">
              <label>Wybierz plik CSV</label>
              <input ref={fileRef} type="file" accept=".csv" onChange={importujCSV} disabled={importowanie} style={{ padding: '8px', border: '0.5px solid var(--border)', borderRadius: '8px', width: '100%' }} />
            </div>
            {importowanie && <div style={{ textAlign: 'center', padding: '12px', color: 'var(--brand)' }}>Importowanie...</div>}
            {importStatus.map((s, i) => (
              <div key={i} className="profil-card" style={{ marginBottom: '6px', borderLeft: s.status === 'Dodano!' ? '3px solid #2e7d32' : '3px solid #c62828' }}>
                <div className="profil-row"><span className="profil-lbl">{s.imie} {s.nazwisko}</span><span className="profil-val" style={{ color: s.status === 'Dodano!' ? '#2e7d32' : '#c62828' }}>{s.status}</span></div>
              </div>
            ))}
          </>
        )}

        {aktywnaZakladka === 'ankiety' && (
          <>
            <h2 className="page-title">Wyniki ankiet</h2>
            <div className="login-field" style={{ marginBottom: '12px' }}>
              <label>Filtruj po grupie</label>
              <select value={wybranaGrupaAnkiety} onChange={e => setWybranaGrupaAnkiety(e.target.value)}>
                <option value="">Wszystkie grupy ({ankiety.length})</option>
                {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa} ({ankiety.filter((a: any) => a.grupa_id === g.id).length})</option>)}
              </select>
            </div>
            <button className="login-btn" style={{ marginBottom: '16px' }} onClick={eksportujAnkietyCSV}>⬇ Pobierz CSV</button>
            {ankietyFiltrowane.length === 0 ? (
              <div className="profil-card"><div className="profil-row"><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Brak ankiet.</p></div></div>
            ) : (
              <div className="profil-card">
                <div className="profil-row"><span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', color: 'var(--brand)' }}>Średnie ({ankietyFiltrowane.length} ankiet)</span></div>
                {[['Zadowolenie', 'zadowolenie'], ['Zajęcia teoretyczne', 'zajecia_teoretyczne'], ['Rysunek techniczny', 'zajecia_rysunek'], ['Programy komputerowe', 'zajecia_programy'], ['Zakres tematyczny', 'zakres_tematyczny'], ['Czas trwania', 'org_czas'], ['Miejsce', 'org_miejsce'], ['Baza dydaktyczna', 'org_baza'], ['Materiały', 'org_materialy'], ['Kadra', 'org_kadra'], ['Dostosowanie', 'org_dostosowanie'], ['Spełnienie oczekiwań', 'stopien_oczekiwan'], ['Ocena ogólna', 'ocena_ogolna']].map(([label, pole]) => (
                  <div key={pole} className="profil-row">
                    <span className="profil-lbl">{label}</span>
                    <span className="profil-val" style={{ color: 'var(--brand)' }}>{'★'.repeat(Math.round(parseFloat(srednia(pole as keyof OdpowiedziAnkiety, ankietyFiltrowane))))} {srednia(pole as keyof OdpowiedziAnkiety, ankietyFiltrowane)}/5</span>
                  </div>
                ))}
                <div className="profil-row"><span className="profil-lbl">Wiedza wzrosła (Tak)</span><span className="profil-val" style={{ color: 'var(--brand)' }}>{Math.round(ankietyFiltrowane.filter((a: any) => a.wiedza_wzrosla === 'Tak').length / ankietyFiltrowane.length * 100)}%</span></div>
                <div className="profil-row"><span className="profil-lbl">Polecenie (Tak)</span><span className="profil-val" style={{ color: 'var(--brand)' }}>{Math.round(ankietyFiltrowane.filter((a: any) => a.nps === 'Tak').length / ankietyFiltrowane.length * 100)}%</span></div>
              </div>
            )}
          </>
        )}

        {/* ZAKŁADKA: Zadania */}
        {aktywnaZakladka === 'zadania' && (
          <>
            <h2 className="page-title">Nowe zadanie</h2>
            <form className="admin-form" onSubmit={dodajZadanie}>
              <div className="login-field">
                <label>Grupa</label>
                <select value={noweZadanie.grupa_id} onChange={e => { setNoweZadanie({ ...noweZadanie, grupa_id: e.target.value }); setWybranaGrupaZadan(e.target.value); }} required>
                  <option value="">Wybierz grupę</option>
                  {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                </select>
              </div>
              <div className="login-field"><label>Tytuł zadania</label><input type="text" value={noweZadanie.tytul} onChange={e => setNoweZadanie({ ...noweZadanie, tytul: e.target.value })} placeholder="np. Przygotuj rzut mieszkania" required /></div>
              <div className="login-field"><label>Opis / instrukcja</label><textarea value={noweZadanie.opis} onChange={e => setNoweZadanie({ ...noweZadanie, opis: e.target.value })} rows={4} placeholder="Co dokładnie należy przygotować..." /></div>
              <div className="login-field"><label>Termin (opcjonalnie)</label><input type="date" value={noweZadanie.termin} onChange={e => setNoweZadanie({ ...noweZadanie, termin: e.target.value })} /></div>
              <div className="login-field"><label>Link do materiałów (opcjonalnie)</label><input type="url" value={noweZadanie.link_materialow} onChange={e => setNoweZadanie({ ...noweZadanie, link_materialow: e.target.value })} placeholder="https://drive.google.com/..." /></div>
              <div className="login-field"><label>Typ</label><select value={noweZadanie.typ} onChange={e => setNoweZadanie({ ...noweZadanie, typ: e.target.value })}><option value="zadanie">Zadanie domowe</option><option value="praca_zaliczeniowa">Praca zaliczeniowa</option></select></div>
              <button className="login-btn" type="submit">Dodaj zadanie</button>
            </form>

            <h2 className="page-title" style={{ marginTop: '24px' }}>Lista zadań</h2>
            <div className="login-field" style={{ marginBottom: '12px' }}>
              <label>Filtruj po grupie</label>
              <select value={wybranaGrupaZadan} onChange={e => setWybranaGrupaZadan(e.target.value)}>
                <option value="">Wszystkie grupy</option>
                {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
              </select>
            </div>

            {zadania
              .filter(z => !wybranaGrupaZadan || z.grupa_id === parseInt(wybranaGrupaZadan))
              .map(z => {
                const odp = odpowiedziZadan.filter(o => o.zadanie_id === z.id);
                return (
                  <div key={z.id} className="profil-card" style={{ marginBottom: '10px' }}>
                    <div className="profil-row">
                      <span className="profil-lbl" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 500 }}>{z.tytul}</span>
                      <button onClick={() => usunZadanie(z.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '18px' }}>×</button>
                    </div>
                    <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{grupy.find(g => g.id === z.grupa_id)?.nazwa || '-'}</span></div>
                    {z.termin && <div className="profil-row"><span className="profil-lbl">Termin</span><span className="profil-val">{new Date(z.termin).toLocaleDateString('pl-PL')}</span></div>}
                    {z.link_materialow && (
                      <div className="profil-row">
                        <span className="profil-lbl">Materiały</span>
                        <a href={z.link_materialow} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand)' }}>Otwórz →</a>
                      </div>
                    )}
                    {/* Odpowiedzi kursantów */}
                    {odp.length > 0 && (
                      <div style={{ margin: '8px 16px 12px', background: '#f8f8f8', borderRadius: '10px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
                          Przesłane prace ({odp.length})
                        </p>
                        {odp.map(o => (
                          <div key={o.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)' }}>
                            <p style={{ fontSize: '13px', fontWeight: 500 }}>{o.imie} {o.nazwisko}</p>
                            <a href={o.link_pracy} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                              {o.link_pracy}
                            </a>
                            {o.komentarz && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{o.komentarz}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {odp.length === 0 && (
                      <div style={{ padding: '0 16px 12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Brak przesłanych prac</span>
                      </div>
                    )}
                  </div>
                );
              })
            }
          </>
        )}

        {/* ZAKŁADKA: Obecności w panelu biura */}
        {aktywnaZakladka === 'obecnosci' && (
          <AdminObecnosci grupy={grupy} zjazdy={zjazdy} />
        )}

        {/* ZAKŁADKA: Prowadzący */}
        {aktywnaZakladka === 'prowadzacy' && (
          <>
            <h2 className="page-title">Nowy prowadzący</h2>
            <form className="admin-form" onSubmit={dodajProwadzacego}>
              <div className="login-field"><label>Imię</label><input type="text" value={nowyProwadzacy.imie} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, imie: e.target.value })} required /></div>
              <div className="login-field"><label>Nazwisko</label><input type="text" value={nowyProwadzacy.nazwisko} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, nazwisko: e.target.value })} required /></div>
              <button className="login-btn" type="submit">Dodaj prowadzącego</button>
            </form>
            <h2 className="page-title" style={{ marginTop: '24px' }}>Lista prowadzących</h2>
            {prowadzacy.length === 0 && (
              <div className="profil-card"><div className="profil-row"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Brak prowadzących. Dodaj pierwszego powyżej.</span></div></div>
            )}
            {prowadzacy.map(p => (
              <div key={p.id} className="profil-card" style={{ marginBottom: '8px' }}>
                <div className="profil-row">
                  <span className="profil-lbl" style={{ fontWeight: 600 }}>{p.imie} {p.nazwisko}</span>
                  <button onClick={() => usunProwadzacego(p.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>×</button>
                </div>
                {/* Zjazdy przypisane do tego prowadzącego */}
                {(() => {
                  const przypisane = zjazdy.filter(z => (z.prowadzacy || []).some(x => x.id === p.id));
                  return przypisane.length > 0 ? (
                    <div className="profil-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <span className="profil-lbl" style={{ marginBottom: '4px' }}>Przypisany do zjazdów:</span>
                      {przypisane.map(z => (
                        <span key={z.id} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Zjazd {z.nr} — {z.daty} ({grupy.find(g => g.id === z.grupa_id)?.nazwa || '?'})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="profil-row"><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Brak przypisanych zjazdów</span></div>
                  );
                })()}
              </div>
            ))}
          </>
        )}
      </main>

      <nav className="bottom-nav" style={{ overflowX: 'auto' }}>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setEdytowane(null); setAktywnaZakladka('ogloszenia'); }}><Bell size={20} /><span className="nav-label">Ogłoszenia</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setEdytowanyZjazd(null); setAktywnaZakladka('zjazdy'); }}><Calendar size={20} /><span className="nav-label">Zjazdy</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'zadania' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('zadania'); }}><BookOpen size={20} /><span className="nav-label">Zadania</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'kursanci' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('kursanci'); }}><User size={20} /><span className="nav-label">Kursanci</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'grupy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('grupy'); }}><Home size={20} /><span className="nav-label">Grupy</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'prowadzacy' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('prowadzacy'); }}><Star size={20} /><span className="nav-label">Prowadz.</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'ankiety' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('ankiety'); }}><CheckSquare size={20} /><span className="nav-label">Ankiety</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'obecnosci' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('obecnosci'); }}><Bell size={20} /><span className="nav-label">Obecność</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'import' ? 'active' : ''}`} onClick={() => { setKomunikat(''); setAktywnaZakladka('import'); }}><MessageCircle size={20} /><span className="nav-label">Import</span></button>
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

function renderTekstZLinkami(tekst: string) {
  if (!tekst) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const czesci = tekst.split(urlRegex);
  return czesci.map((czesc, i) =>
    urlRegex.test(czesc) ? (
      <a
        key={i}
        href={czesc}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--brand)',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
          wordBreak: 'break-all',
        }}
      >
        {czesc}
      </a>
    ) : (
      <span key={i}>{czesc}</span>
    )
  );
}

function EkranSzczegoly({ o, onWroc }: { o: Ogloszenie; onWroc: () => void }) {
  return (
    <>
      <button className="btn-wroc" onClick={onWroc}>← Wróć</button>
      <div className="szczegoly-header">
        <span className={`badge badge-${o.typ.toLowerCase()}`}>{o.typ}</span>
        <h2 className="szczegoly-tytul">{o.tytul}</h2>
        <p className="szczegoly-meta">Biuro On-Arch · {new Date(o.data_utworzenia).toLocaleDateString('pl-PL')}</p>
      </div>
      <div className="szczegoly-tresc">
        {renderTekstZLinkami(o.szczegoly || o.tresc)}
      </div>
    </>
  );
}

function liczDni(dataZjazdu: string): string {
  if (!dataZjazdu) return '';
  const dzisiaj = new Date(); dzisiaj.setHours(0, 0, 0, 0);
  const cel = new Date(dataZjazdu); cel.setHours(0, 0, 0, 0);
  const diff = Math.round((cel.getTime() - dzisiaj.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Dzisiaj!';
  if (diff === 1) return 'Jutro!';
  if (diff < 0) return '';
  return `Za ${diff} dni`;
}

function EkranGlowny({ ogloszenia, zjazdy, onOtworzOgloszenie, user, kursant, onNavigate, zadania, nieprzeslaneZadania, noweCzat }: {
  ogloszenia: Ogloszenie[];
  zjazdy: Zjazd[];
  onOtworzOgloszenie: (o: Ogloszenie) => void;
  user: User;
  kursant: Kursant | null;
  onNavigate: (zakl: string) => void;
  zadania: Zadanie[];
  nieprzeslaneZadania: number;
  noweCzat: boolean;
}) {
  const imie = kursant ? kursant.imie : user.email.split('@')[0];
  const najblizszy = zjazdy.find(z => z.status === 'nadchodzacy');
  const odliczanie = najblizszy ? liczDni(najblizszy.data_zjazdu) : '';
  const najblizszZadanie = zadania
    .filter(z => z.typ !== 'praca_zaliczeniowa' && z.termin)
    .sort((a, b) => new Date(a.termin!).getTime() - new Date(b.termin!).getTime())[0];

  return (
    <>
      <p className="greeting">Dzień dobry, {imie}</p>

      {/* Kafelki skrótów */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {nieprzeslaneZadania > 0 && (
          <div onClick={() => onNavigate('zadania')} style={{
            background: 'var(--brand-dark)', borderRadius: '16px', padding: '16px',
            cursor: 'pointer', color: 'white',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📋</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{nieprzeslaneZadania} {nieprzeslaneZadania === 1 ? 'zadanie' : 'zadania'}</div>
            <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '2px' }}>do przesłania</div>
          </div>
        )}
        {najblizszZadanie && (
          <div onClick={() => onNavigate('zadania')} style={{
            background: 'white', borderRadius: '16px', padding: '16px',
            cursor: 'pointer', border: '0.5px solid var(--border)',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📌</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{najblizszZadanie.tytul}</div>
            <div style={{ fontSize: '11px', color: 'var(--brand)', marginTop: '4px', fontWeight: 500 }}>
              do {new Date(najblizszZadanie.termin!).toLocaleDateString('pl-PL')}
            </div>
          </div>
        )}
        {noweCzat && (
          <div onClick={() => onNavigate('czat')} style={{
            background: '#e8f4fd', borderRadius: '16px', padding: '16px',
            cursor: 'pointer', border: '0.5px solid #b3d9f7',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>💬</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1565c0' }}>Nowe wiadomości</div>
            <div style={{ fontSize: '11px', color: '#1976d2', marginTop: '2px' }}>w czacie grupy</div>
          </div>
        )}
      </div>

      <section className="section">
        <div className="section-header"><span className="section-title">Najbliższy zjazd</span></div>
        {najblizszy ? (
          <div className="hero-card">
            <div className="hero-label">Zjazd {najblizszy.nr}</div>
            {odliczanie && <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '8px', letterSpacing: '0.5px' }}>{odliczanie}</div>}
            <div className="hero-date">{najblizszy.daty}</div>
            <div className="hero-sub">{kursant?.grupy?.miasto || 'Warszawa'}</div>
            <div className="hero-pills">
              <span className="pill">{najblizszy.sala}</span>
              <span className="pill">{najblizszy.adres}</span>
            </div>
          </div>
        ) : (
          <div className="hero-card"><div className="hero-date">Brak nadchodzących zjazdów</div></div>
        )}
      </section>
      <section className="section">
        <div className="section-header"><span className="section-title">Ogłoszenia biura</span></div>
        {ogloszenia.slice(0, 3).map((o) => <KartaOgloszenia key={o.id} o={o} onClick={() => onOtworzOgloszenie(o)} />)}
      </section>
    </>
  );
}

function ModalProwadzacy({ p, onZamknij }: { p: Prowadzacy; onZamknij: () => void }) {
  return (
    <div
      onClick={onZamknij}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '24px 24px 0 0',
          width: '100%', padding: '0 0 40px',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Uchwyt */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#e0d8d4' }} />
        </div>

        {/* Zdjęcie + imię */}
        <div style={{ textAlign: 'center', padding: '20px 24px 16px' }}>
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt={p.imie}
              style={{
                width: '96px', height: '96px', borderRadius: '50%',
                objectFit: 'cover', border: '3px solid var(--brand-light)',
                marginBottom: '14px',
              }}
            />
          ) : (
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'var(--brand-light)', color: 'var(--brand)',
              fontSize: '36px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              fontFamily: 'Cormorant Garamond, serif',
            }}>
              {p.imie[0]}
            </div>
          )}
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px', fontWeight: 500, color: 'var(--text)',
            marginBottom: '4px',
          }}>
            {p.imie} {p.nazwisko}
          </div>
        </div>

        {/* Bio */}
        {p.bio && (
          <div style={{
            margin: '0 20px', padding: '16px 18px',
            background: '#faf6f3', borderRadius: '14px',
            fontSize: '14px', color: 'var(--text)',
            lineHeight: '1.75', whiteSpace: 'pre-line',
            border: '0.5px solid var(--border)',
          }}>
            {p.bio}
          </div>
        )}

        <button
          onClick={onZamknij}
          style={{
            display: 'block', margin: '16px 20px 0',
            width: 'calc(100% - 40px)', padding: '14px',
            background: 'var(--brand-light)', color: 'var(--brand)',
            border: 'none', borderRadius: '14px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Jost, sans-serif',
          }}
        >
          Zamknij
        </button>
      </div>
    </div>
  );
}

function EkranZjazdy({ zjazdy, user, kursant }: { zjazdy: Zjazd[]; user: User; kursant: Kursant | null }) {
  const [obecnosci, setObecnosci] = useState<Obecnosc[]>([]);
  const [wysylanie, setWysylanie] = useState<number | null>(null);
  const [modalProwadzacy, setModalProwadzacy] = useState<Prowadzacy | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('obecnosci').select('*').eq('user_id', user.id)
      .then(({ data }) => setObecnosci(data || []));
  }, [user]);

  const czyPotwierdzony = (zjazdId: number) => obecnosci.some(o => o.zjazd_id === zjazdId);

  async function potwierdz(z: Zjazd) {
    if (!kursant) return;
    setWysylanie(z.id);
    await supabase.from('obecnosci').insert([{
      zjazd_id: z.id, user_id: user.id,
      grupa_id: kursant.grupa_id, imie: kursant.imie, nazwisko: kursant.nazwisko,
    }]);
    const { data } = await supabase.from('obecnosci').select('*').eq('user_id', user.id);
    setObecnosci(data || []);
    setWysylanie(null);
  }

  async function odwolaj(z: Zjazd) {
    setWysylanie(z.id);
    await supabase.from('obecnosci').delete().eq('zjazd_id', z.id).eq('user_id', user.id);
    const { data } = await supabase.from('obecnosci').select('*').eq('user_id', user.id);
    setObecnosci(data || []);
    setWysylanie(null);
  }

  return (
    <>
      <h2 className="page-title">Plan zjazdów</h2>
      {zjazdy.map((z) => {
        const potwierdzono = czyPotwierdzony(z.id);
        const trwa = wysylanie === z.id;
        const zakonczone = z.status === 'zakonczony';
        return (
          <div key={z.id} className={`sess-card ${z.status}`} style={{ borderColor: potwierdzono ? '#7aab8a' : undefined }}>
            <div className="sess-top" style={{ background: potwierdzono ? '#f0faf4' : undefined }}>
              <span className="sess-nr">Zjazd {z.nr}</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {potwierdzono && <span style={{ fontSize: '10px', fontWeight: 600, color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>✓ Obecny/a</span>}
                <span className={`s-badge s-${z.status}`}>{z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}</span>
              </div>
            </div>
            <div className="sess-date">{z.daty}</div>
            <div className="sess-rows">
              {z.sala && z.sala !== 'Do uzupełnienia' && <div className="sess-row"><span className="sess-lbl">Sala:</span> {z.sala}</div>}
              {z.adres && z.adres !== 'Do uzupełnienia' && <div className="sess-row"><span className="sess-lbl">Adres:</span> {z.adres}</div>}
              {z.tematy && <div className="sess-row"><span className="sess-lbl">Temat:</span> {z.tematy}</div>}
              {z.prowadzacy && z.prowadzacy.length > 0 && (
                <div className="sess-row" style={{ marginTop: '4px', paddingTop: '6px', borderTop: '0.5px solid var(--border-soft)' }}>
                  <span className="sess-lbl">Prowadzący:</span>{' '}
                  {z.prowadzacy.map((p, i) => (
                    <span key={p.id}>
                      <button onClick={() => setModalProwadzacy(p)} style={{
                        background: 'none', border: 'none', padding: 0, color: 'var(--brand)', fontWeight: 600,
                        fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                        textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px',
                      }}>{p.imie} {p.nazwisko}</button>
                      {i < z.prowadzacy!.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Potwierdzenie obecności inline */}
            {!zakonczone && (
              <div style={{ padding: '0 14px 14px' }}>
                {potwierdzono ? (
                  <button onClick={() => odwolaj(z)} disabled={trwa} style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '0.5px solid #c8e6c9', background: 'white',
                    color: '#2e7d32', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                  }}>{trwa ? 'Cofanie...' : 'Cofnij potwierdzenie'}</button>
                ) : (
                  <button onClick={() => potwierdz(z)} disabled={trwa} className="login-btn" style={{ width: '100%', marginTop: 0, padding: '10px' }}>
                    {trwa ? 'Potwierdzanie...' : '✓ Potwierdzam obecność'}
                  </button>
                )}
              </div>
            )}
            {zakonczone && potwierdzono && (
              <div style={{ padding: '0 14px 12px', fontSize: '12px', color: '#2e7d32' }}>✓ Byłeś/aś obecny/a</div>
            )}
          </div>
        );
      })}
      {modalProwadzacy && <ModalProwadzacy p={modalProwadzacy} onZamknij={() => setModalProwadzacy(null)} />}
    </>
  );
}

function EkranOgloszenia({ ogloszenia, onOtworzOgloszenie }: { ogloszenia: Ogloszenie[]; onOtworzOgloszenie: (o: Ogloszenie) => void }) {
  return (
    <>
      <h2 className="page-title">Ogłoszenia</h2>
      {ogloszenia.map((o) => <KartaOgloszenia key={o.id} o={o} onClick={() => onOtworzOgloszenie(o)} />)}
    </>
  );
}

function PostepKursu({ zjazdy }: { zjazdy: Zjazd[] }) {
  const wszystkie = zjazdy.length;
  const zakonczone = zjazdy.filter(z => z.status === 'zakonczony').length;
  const procent = wszystkie > 0 ? Math.round((zakonczone / wszystkie) * 100) : 0;
  return (
    <div className="profil-postep">
      <div className="profil-postep-header">
        <span className="profil-postep-label">Postęp kursu</span>
        <span className="profil-postep-count">{zakonczone} / {wszystkie} zjazdów</span>
      </div>
      <div className="profil-postep-track">
        <div className="profil-postep-fill" style={{ width: `${procent}%` }} />
      </div>
      <div className="profil-postep-footer">
        <span>{zakonczone === 0 ? 'Kurs jeszcze nie rozpoczęty' : zakonczone === wszystkie ? 'Kurs ukończony! 🎉' : `${procent}% ukończone`}</span>
        <span>{wszystkie - zakonczone > 0 ? `Zostało ${wszystkie - zakonczone} zjazdów` : ''}</span>
      </div>
    </div>
  );
}

function EkranProfil({ user, kursant, zjazdy, onWyloguj, onAvatarZmieniony, grupaInfo, onOtworzAnkiete }: { user: User; kursant: Kursant | null; zjazdy: Zjazd[]; onWyloguj: () => void; onAvatarZmieniony: (url: string) => void; grupaInfo: Grupa | null; onOtworzAnkiete: () => void }) {
  const [uploadowanie, setUploadowanie] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const inicjal = kursant ? kursant.imie[0] : user.email[0].toUpperCase();
  const nazwaGrupy = kursant?.grupy?.nazwa || 'Brak przypisania do grupy';
  const miasto = kursant?.grupy?.miasto || '';
  const edycja = kursant?.grupy?.edycja || '';
  const ostatniZjazd = zjazdy.length > 0 ? zjazdy[zjazdy.length - 1] : null;
  const ankietaDostepna = ostatniZjazd?.status === 'zakonczony';

  async function wgrajZdjecie(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadowanie(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { alert('Blad wgrywania: ' + uploadError.message); setUploadowanie(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('kursanci').update({ avatar_url: data.publicUrl }).eq('user_id', user.id);
    onAvatarZmieniony(data.publicUrl);
    setUploadowanie(false);
  }

  return (
    <>
      <div className="profil-header">
        <div className="profil-avatar-wrap" onClick={() => fileRef.current?.click()}>
          {kursant?.avatar_url ? <img src={kursant.avatar_url} alt="avatar" className="profil-avatar-img" /> : <div className="profil-avatar">{inicjal.toUpperCase()}</div>}
          <div className="profil-avatar-edit">{uploadowanie ? '...' : '📷'}</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={wgrajZdjecie} style={{ display: 'none' }} />
        <div className="profil-name">{kursant ? `${kursant.imie} ${kursant.nazwisko}` : user.email}</div>
        <div className="profil-group">{nazwaGrupy}</div>
      </div>
      <div className="profil-card">
        <div className="profil-row"><span className="profil-lbl">Kurs</span><span className="profil-val">Projektowanie wnętrz</span></div>
        <div className="profil-row"><span className="profil-lbl">Miasto</span><span className="profil-val">{miasto}</span></div>
        <div className="profil-row"><span className="profil-lbl">Edycja</span><span className="profil-val">{edycja}</span></div>
        <div className="profil-row"><span className="profil-lbl">Email</span><span className="profil-val">{user.email}</span></div>
        <div className="profil-row"><span className="profil-lbl">Telefon biura</span><span className="profil-val">883 659 069</span></div>
        <PostepKursu zjazdy={zjazdy} />
      </div>

      {/* Strefa Wiedzy */}
      {grupaInfo?.drive_link && (
        <a href={grupaInfo.drive_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '16px 18px',
            border: '0.5px solid var(--border)', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📁</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Strefa Wiedzy</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Materiały szkoleniowe grupy · Google Drive</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)', fontSize: '18px' }}>→</span>
          </div>
        </a>
      )}

      {/* Ankieta — widoczna tylko gdy kurs zakończony */}
      {ankietaDostepna && (
        <div onClick={onOtworzAnkiete} style={{
          background: 'var(--brand-dark)', borderRadius: '16px', padding: '16px 18px',
          marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px',
          cursor: 'pointer',
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>⭐</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>Ankieta oceny kursu</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Twoja opinia jest dla nas ważna</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'white', fontSize: '18px' }}>→</span>
        </div>
      )}

      <button className="btn-wyloguj" onClick={onWyloguj}>Wyloguj się</button>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [kursant, setKursant] = useState<Kursant | null>(null);
  const [grupaInfo, setGrupaInfo] = useState<Grupa | null>(null);
  const [aktywnaZakladka, setAktywnaZakladka] = useState('home');
  const [aktywneOgloszenie, setAktywneOgloszenie] = useState<Ogloszenie | null>(null);
  const [pokazAnkiete, setPokazAnkiete] = useState(false);
  const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
  const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
  const [zadania, setZadania] = useState<Zadanie[]>([]);
  const [odpowiedziZadan, setOdpowiedziZadan] = useState<ZadanieOdpowiedz[]>([]);
  const [ostatniaCzatMsg, setOstatniaCzatMsg] = useState<string | null>(null);
  const [noweCzat, setNoweCzat] = useState(false);
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
      // Sprawdź czy to prowadzący (ma user_id w tabeli prowadzacy)
      const { data: prowData } = await supabase
        .from('prowadzacy')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (prowData) {
        // To jest prowadzący — ustaw minimalny kursant z rolą prowadzacy
        setKursant({ imie: '', nazwisko: '', grupa_id: 0, rola: 'prowadzacy', avatar_url: null, grupy: null });
        setLadowanie(false);
        return;
      }

      const { data: kursantData } = await supabase.from('kursanci').select('imie, nazwisko, grupa_id, rola, avatar_url').eq('user_id', user!.id).single();
      let grupaData = null;
      if (kursantData?.grupa_id) {
        const { data } = await supabase.from('grupy').select('id, nazwa, miasto, edycja, drive_link').eq('id', kursantData.grupa_id).single();
        grupaData = data;
        setGrupaInfo(data as Grupa | null);
      }
      setKursant(kursantData ? { ...kursantData, grupy: grupaData } as Kursant : null);
      await aktualizujStatusyZjazdow();
      const grupaId = kursantData?.grupa_id;
      const [{ data: og }, { data: zj }] = await Promise.all([
        supabase.from('ogloszenia').select('*').order('data_utworzenia', { ascending: false }),
        grupaId ? supabase.from('zjazdy').select('*').eq('grupa_id', grupaId).order('data_zjazdu', { ascending: true }) : supabase.from('zjazdy').select('*').order('data_zjazdu', { ascending: true }),
      ]);
      setOgloszenia((og || []).filter((o: any) => o.grupa_id === null || o.grupa_id === grupaId));

      // Pobierz prowadzących dla każdego zjazdu
      const zjezdzeIds = (zj || []).map((z: any) => z.id);
      let prowadzacyMap: Record<number, Prowadzacy[]> = {};
      if (zjezdzeIds.length > 0) {
        const { data: zpData } = await supabase
          .from('zjazdy_prowadzacy')
          .select('zjazd_id, prowadzacy(id, imie, nazwisko, bio, avatar_url)')
          .in('zjazd_id', zjezdzeIds);
        (zpData || []).forEach((row: any) => {
          if (!prowadzacyMap[row.zjazd_id]) prowadzacyMap[row.zjazd_id] = [];
          if (row.prowadzacy) prowadzacyMap[row.zjazd_id].push(row.prowadzacy);
        });
      }
      setZjazdy((zj || []).map((z: any) => ({ ...z, prowadzacy: prowadzacyMap[z.id] || [] })));

      // Pobierz zadania i odpowiedzi kursanta
      if (grupaId) {
        const [{ data: zad }, { data: odp }] = await Promise.all([
          supabase.from('zadania').select('*').eq('grupa_id', grupaId).order('created_at', { ascending: false }),
          supabase.from('zadania_odpowiedzi').select('*').eq('user_id', user!.id),
        ]);
        setZadania(zad || []);
        setOdpowiedziZadan(odp || []);
      }

      // Sprawdź czy są nowe wiadomości w czacie (ostatnia wiadomość nie od tego usera)
      if (grupaId) {
        const { data: ostatnia } = await supabase
          .from('wiadomosci').select('*').eq('grupa_id', grupaId)
          .order('created_at', { ascending: false }).limit(1).single();
        if (ostatnia && ostatnia.user_id !== user!.id) {
          const poprzednia = localStorage.getItem(`czat_last_${grupaId}`);
          if (poprzednia !== ostatnia.id?.toString()) setNoweCzat(true);
        }
      }
    }
    pobierzDane();
  }, [user]);

  async function aktualizujStatusyZjazdow() {
    const dzisiaj = new Date().toISOString().split('T')[0];
    const { data: przestarzale } = await supabase.from('zjazdy').select('*').eq('status', 'nadchodzacy').lt('data_zjazdu', dzisiaj);
    if (!przestarzale || przestarzale.length === 0) return;
    for (const zjazd of przestarzale) {
      await supabase.from('zjazdy').update({ status: 'zakonczony' }).eq('id', zjazd.id);
      const { data: wszystkieZjazdy } = await supabase.from('zjazdy').select('*').eq('grupa_id', zjazd.grupa_id).order('data_zjazdu', { ascending: true });
      const pozostaleNadchodzace = (wszystkieZjazdy || []).filter(z => z.id !== zjazd.id && z.status === 'nadchodzacy' && z.data_zjazdu >= dzisiaj);
      if (pozostaleNadchodzace.length === 0) {
        const { data: istniejace } = await supabase.from('ogloszenia').select('id').eq('tytul', 'Wypełnij ankietę oceny kursu ⭐').maybeSingle();
        if (!istniejace) {
          const { data: grupaInfo } = await supabase.from('grupy').select('nazwa').eq('id', zjazd.grupa_id).single();
          await supabase.from('ogloszenia').insert([{ typ: 'Informacja', tytul: 'Wypełnij ankietę oceny kursu ⭐', tresc: 'Twój kurs dobiegł końca. Prosimy o wypełnienie krótkiej ankiety — to tylko kilka minut!', szczegoly: 'Dziękujemy za udział w kursie ' + (grupaInfo?.nazwa || 'Twoja grupa') + '!\n\nProsimy o wypełnienie krótkiej ankiety. Znajdziesz ją w zakładce Ankieta.\n\nZ góry dziękujemy!\nZespół On-Arch', nowe: true, data_utworzenia: new Date().toISOString() }]);
        }
      }
    }
  }

  async function wyloguj() {
    await supabase.auth.signOut();
    setUser(null); setKursant(null); setResetMode(false);
  }

  async function otworzOgloszenie(o: Ogloszenie) {
    setAktywneOgloszenie(o);
    if (o.nowe) {
      await supabase.from('ogloszenia').update({ nowe: false }).eq('id', o.id);
      setOgloszenia(prev => prev.map(og => og.id === o.id ? { ...og, nowe: false } : og));
    }
  }

  function onAvatarZmieniony(url: string) { setKursant(prev => prev ? { ...prev, avatar_url: url } : prev); }

  const noweCount = ogloszenia.filter((o) => o.nowe).length;
  const avatarUrl = kursant?.avatar_url;
  const inicjal = kursant ? kursant.imie[0] : user?.email?.[0]?.toUpperCase() || '?';
  const nieprzeslaneZadania = zadania.filter(z =>
    z.typ !== 'praca_zaliczeniowa' && !odpowiedziZadan.some(o => o.zadanie_id === z.id)
  ).length;

  function nawiguj(zakl: string) {
    setAktywneOgloszenie(null);
    setPokazAnkiete(false);
    setAktywnaZakladka(zakl);
    if (zakl === 'czat') {
      setNoweCzat(false);
      const grupaId = kursant?.grupa_id;
      if (grupaId) {
        supabase.from('wiadomosci').select('id').eq('grupa_id', grupaId)
          .order('created_at', { ascending: false }).limit(1).single()
          .then(({ data }) => { if (data) localStorage.setItem(`czat_last_${grupaId}`, data.id.toString()); });
      }
    }
  }

  if (ladowanie) return <div className="ladowanie">Ładowanie...</div>;
  if (resetMode) return <EkranZmianaHasla />;
  if (!user) return <EkranLogowania onZalogowano={() => {}} />;
  if (kursant?.rola === 'admin') return <PanelBiura onWyloguj={wyloguj} />;
  if (kursant?.rola === 'prowadzacy') return <PanelProwadzacego user={user} kursant={kursant} onWyloguj={wyloguj} />;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">On<span>-Arch</span></div>
        {avatarUrl ? <img src={avatarUrl} alt="avatar" className="avatar-img" /> : <div className="avatar">{inicjal.toUpperCase()}</div>}
      </header>
      <main className="main">
        {pokazAnkiete ? (
          <div>
            <button className="btn-wroc" onClick={() => setPokazAnkiete(false)} style={{ marginBottom: '12px' }}>← Wróć do profilu</button>
            <EkranAnkieta kursant={kursant} zjazdy={zjazdy} user={user} />
          </div>
        ) : aktywneOgloszenie ? (
          <EkranSzczegoly o={aktywneOgloszenie} onWroc={() => setAktywneOgloszenie(null)} />
        ) : (
          <>
            {aktywnaZakladka === 'home' && (
              <EkranGlowny
                ogloszenia={ogloszenia} zjazdy={zjazdy}
                onOtworzOgloszenie={otworzOgloszenie}
                user={user} kursant={kursant}
                onNavigate={nawiguj}
                zadania={zadania}
                nieprzeslaneZadania={nieprzeslaneZadania}
                noweCzat={noweCzat}
              />
            )}
            {aktywnaZakladka === 'zjazdy' && <EkranZjazdy zjazdy={zjazdy} user={user} kursant={kursant} />}
            {aktywnaZakladka === 'ogloszenia' && <EkranOgloszenia ogloszenia={ogloszenia} onOtworzOgloszenie={otworzOgloszenie} />}
            {aktywnaZakladka === 'zadania' && <EkranZadania user={user} kursant={kursant} />}
            {aktywnaZakladka === 'czat' && <EkranCzat user={user} kursant={kursant} />}
            {aktywnaZakladka === 'profil' && (
              <EkranProfil
                user={user} kursant={kursant} zjazdy={zjazdy}
                onWyloguj={wyloguj} onAvatarZmieniony={onAvatarZmieniony}
                grupaInfo={grupaInfo}
                onOtworzAnkiete={() => setPokazAnkiete(true)}
              />
            )}
          </>
        )}
      </main>
      <nav className="bottom-nav">
        <button className={`nav-item ${aktywnaZakladka === 'home' ? 'active' : ''}`} onClick={() => nawiguj('home')}><Home size={20} /><span className="nav-label">Główna</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => nawiguj('zjazdy')}><Calendar size={20} /><span className="nav-label">Zjazdy</span></button>
        <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => nawiguj('ogloszenia')}>
          <Bell size={20} /><span className="nav-label">Ogłoszenia</span>
          {noweCount > 0 && <span className="nav-badge">{noweCount}</span>}
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'zadania' ? 'active' : ''}`} onClick={() => nawiguj('zadania')}>
          <BookOpen size={20} /><span className="nav-label">Zadania</span>
          {nieprzeslaneZadania > 0 && <span className="nav-badge">{nieprzeslaneZadania}</span>}
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'czat' ? 'active' : ''}`} onClick={() => nawiguj('czat')}>
          <MessageCircle size={20} /><span className="nav-label">Czat</span>
          {noweCzat && <span className="nav-badge" style={{ background: '#1976d2' }}>•</span>}
        </button>
        <button className={`nav-item ${aktywnaZakladka === 'profil' ? 'active' : ''}`} onClick={() => nawiguj('profil')}><User size={20} /><span className="nav-label">Profil</span></button>
      </nav>
    </div>
  );
}