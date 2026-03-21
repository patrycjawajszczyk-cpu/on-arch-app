import { useState, useEffect, useRef } from 'react';
import './App.css';
import { supabase } from './supabase';
import { Home, Calendar, Bell, MessageCircle, User, CheckSquare, BookOpen, Star } from 'lucide-react';

function OnArchLogo({ color = '#2a1f1f', height = 28 }: { color?: string; height?: number }) {
  const scale = height / 80;
  const w = 420 * scale;
  return (
    <svg width={w} height={height} viewBox="0 0 420 80" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(80,40)">
        <circle cx="22" cy="0" r="22" fill="none" stroke={color} strokeWidth="1.8"/>
        <path d="M56 0 A22 22 0 0 1 100 0" fill="none" stroke={color} strokeWidth="1.8"/>
        <text x="116" y="16" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="200" fontSize="48" letterSpacing="4" fill={color}>ARCH</text>
      </g>
    </svg>
  );
}

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
  email: string | null;
  telefon: string | null;
  notatki: string | null;
  miasto: string | null;
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
  typ: 'stacjonarny' | 'online';
  link_online: string | null;
  data_zjazdu: string;
  data_dzien1: string | null;
  data_dzien2: string | null;
  godzina_start_d1: string | null;
  godzina_end_d1: string | null;
  godzina_start_d2: string | null;
  godzina_end_d2: string | null;
  grupa_id: number;
  prowadzacy?: Prowadzacy[];
};

type Kursant = {
  imie: string;
  nazwisko: string;
  email?: string;
  grupa_id: number;
  rola: string;
  avatar_url: string | null;
  certyfikat_url: string | null;
  onboarding_done: boolean;
  grupy: { nazwa: string; miasto: string; edycja: string; numer_uslugi?: string | null } | null;
};

type KursantAdmin = {
  id: number;
  imie: string;
  nazwisko: string;
  grupa_id: number;
  user_id: string;
  email: string | null;
  telefon: string | null;
  certyfikat_url: string | null;
};

type Grupa = {
  id: number;
  nazwa: string;
  miasto: string;
  edycja: string;
  drive_link: string | null;
  numer_uslugi: string | null;
  tryb: 'stacjonarny' | 'online' | 'hybrydowy' | null;
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
  grupa_id: number;
  imie: string;
  nazwisko: string;
  dzien: number;
  status: string;
  powod_nieobecnosci: string | null;
  godzina_przybycia: string | null;
  godzina_wyjscia: string | null;
  uwagi_godzinowe: string | null;
  zweryfikowano: boolean;
  zweryfikowano_przez: string | null;
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


// ─── PANEL BIURA — zakładka OBECNOŚCI ────────────────────────────────────────

function AdminObecnosci({ grupy, zjazdy }: { grupy: Grupa[]; zjazdy: Zjazd[] }) {
  const [wybranaGrupa, setWybranaGrupa] = useState('');
  const [wybranyZjazd, setWybranyZjazd] = useState('');
  const [lista, setLista] = useState<Obecnosc[]>([]);
  const [ladowanie, setLadowanie] = useState(false);

  const zjazdyGrupy = wybranaGrupa ? zjazdy.filter(z => z.grupa_id === parseInt(wybranaGrupa)) : [];
  const zjazd = zjazdy.find(z => z.id === parseInt(wybranyZjazd));
  const grupa = grupy.find(g => g.id === parseInt(wybranaGrupa));

  useEffect(() => {
    if (!wybranyZjazd) { setLista([]); return; }
    setLadowanie(true);
    supabase.from('obecnosci').select('*').eq('zjazd_id', parseInt(wybranyZjazd))
      .order('dzien', { ascending: true }).order('nazwisko', { ascending: true })
      .then(({ data }) => { setLista(data || []); setLadowanie(false); });
  }, [wybranyZjazd]);

  function eksportujCSV() {
    const naglowki = [
      'imie', 'nazwisko', 'dzien', 'data', 'godziny_zajec',
      'temat', 'tytul_uslugi', 'numer_uslugi', 'prowadzacy',
      'status', 'powod_nieobecnosci', 'godzina_przybycia', 'godzina_wyjscia',
      'zweryfikowano', 'data_potwierdzenia'
    ];
    const wiersze = lista.map(o => {
      const dzienNr = o.dzien;
      const data = dzienNr === 1 ? zjazd?.data_dzien1 : zjazd?.data_dzien2;
      const gStart = dzienNr === 1 ? zjazd?.godzina_start_d1 : zjazd?.godzina_start_d2;
      const gEnd = dzienNr === 1 ? zjazd?.godzina_end_d1 : zjazd?.godzina_end_d2;
      const prowadzacy = (zjazd?.prowadzacy || []).map(p => `${p.imie} ${p.nazwisko}`).join('; ');
      return [
        `"${o.imie}"`, `"${o.nazwisko}"`,
        `"Dzień ${dzienNr}"`,
        `"${data ? new Date(data).toLocaleDateString('pl-PL') : ''}"`,
        `"${gStart && gEnd ? `${gStart}–${gEnd}` : ''}"`,
        `"${zjazd?.tematy || ''}"`,
        `"${grupa?.nazwa || ''}"`,
        `"${(grupa as any)?.numer_uslugi || ''}"`,
        `"${prowadzacy}"`,
        `"${o.status === 'potwierdzono' ? 'obecny/a' : 'nieobecny/a'}"`,
        `"${o.powod_nieobecnosci || ''}"`,
        `"${o.godzina_przybycia || ''}"`,
        `"${o.godzina_wyjscia || ''}"`,
        `"${o.zweryfikowano ? 'tak' : 'nie'}"`,
        `"${new Date(o.confirmed_at).toLocaleString('pl-PL')}"`,
      ].join(',');
    });
    const csv = '\uFEFF' + [naglowki.join(','), ...wiersze].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lista_obecnosci_zjazd${zjazd?.nr || ''}.csv`; a.click();
  }

  function eksportujXML() {
    const prowadzacy = (zjazd?.prowadzacy || []).map(p => `${p.imie} ${p.nazwisko}`).join(', ');
    const wiersze = lista.map(o => {
      const dzienNr = o.dzien;
      const data = dzienNr === 1 ? zjazd?.data_dzien1 : zjazd?.data_dzien2;
      const gStart = dzienNr === 1 ? zjazd?.godzina_start_d1 : zjazd?.godzina_start_d2;
      const gEnd = dzienNr === 1 ? zjazd?.godzina_end_d1 : zjazd?.godzina_end_d2;
      return `    <uczestnik>
      <imie>${o.imie}</imie>
      <nazwisko>${o.nazwisko}</nazwisko>
      <dzien>Dzień ${dzienNr}</dzien>
      <data>${data ? new Date(data).toLocaleDateString('pl-PL') : ''}</data>
      <godziny_zajec>${gStart && gEnd ? `${gStart}–${gEnd}` : ''}</godziny_zajec>
      <temat_zajec>${zjazd?.tematy || ''}</temat_zajec>
      <tytul_uslugi>${grupa?.nazwa || ''}</tytul_uslugi>
      <numer_uslugi>${(grupa as any)?.numer_uslugi || ''}</numer_uslugi>
      <osoba_prowadzaca>${prowadzacy}</osoba_prowadzaca>
      <status>${o.status === 'potwierdzono' ? 'obecny/a' : 'nieobecny/a'}</status>
      <powod_nieobecnosci>${o.powod_nieobecnosci || ''}</powod_nieobecnosci>
      <godzina_przybycia>${o.godzina_przybycia || ''}</godzina_przybycia>
      <godzina_wyjscia>${o.godzina_wyjscia || ''}</godzina_wyjscia>
      <zweryfikowano>${o.zweryfikowano ? 'tak' : 'nie'}</zweryfikowano>
      <data_potwierdzenia>${new Date(o.confirmed_at).toLocaleString('pl-PL')}</data_potwierdzenia>
    </uczestnik>`;
    }).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<lista_obecnosci>
  <informacje>
    <tytul_uslugi>${grupa?.nazwa || ''}</tytul_uslugi>
    <numer_uslugi>${(grupa as any)?.numer_uslugi || ''}</numer_uslugi>
    <zjazd>Zjazd ${zjazd?.nr || ''}</zjazd>
    <daty>${zjazd?.daty || ''}</daty>
    <sala>${zjazd?.sala || ''}</sala>
    <adres>${zjazd?.adres || ''}</adres>
    <osoba_prowadzaca>${prowadzacy}</osoba_prowadzaca>
    <data_eksportu>${new Date().toLocaleString('pl-PL')}</data_eksportu>
  </informacje>
  <uczestnicy>
${wiersze}
  </uczestnicy>
</lista_obecnosci>`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lista_obecnosci_zjazd${zjazd?.nr || ''}.xml`; a.click();
  }

  const statusKolor = (status: string) => status === 'potwierdzono'
    ? { bg: '#e8f5e9', color: '#2e7d32' } : { bg: '#ffebee', color: '#c62828' };

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
            {zjazdyGrupy.map(z => <option key={z.id} value={z.id}>Zjazd {z.nr} — {z.daty}</option>)}
          </select>
        </div>
      )}

      {wybranyZjazd && (
        <>
          {/* Nagłówek z info o zjeździe */}
          {zjazd && (
            <div className="profil-card" style={{ marginBottom: '12px', background: 'var(--brand-light)' }}>
              <div className="profil-row"><span className="profil-lbl">Usługa</span><span className="profil-val" style={{ fontSize: '11px' }}>{grupa?.nazwa || '—'}</span></div>
              {(grupa as any)?.numer_uslugi && <div className="profil-row"><span className="profil-lbl">Nr usługi</span><span className="profil-val" style={{ fontSize: '11px' }}>{(grupa as any).numer_uslugi}</span></div>}
              <div className="profil-row"><span className="profil-lbl">Temat</span><span className="profil-val" style={{ fontSize: '11px' }}>{zjazd.tematy || '—'}</span></div>
              <div className="profil-row"><span className="profil-lbl">Prowadzący</span><span className="profil-val" style={{ fontSize: '11px' }}>{(zjazd.prowadzacy || []).map(p => `${p.imie} ${p.nazwisko}`).join(', ') || '—'}</span></div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {ladowanie ? 'Ładowanie...' : `${lista.length} wpisów`}
            </span>
            {lista.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={eksportujCSV} style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: '0.5px solid var(--brand-mid)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  ⬇ CSV
                </button>
                <button onClick={eksportujXML} style={{ fontSize: '12px', color: '#1565c0', background: 'none', border: '0.5px solid #9ab0d8', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  ⬇ XML
                </button>
              </div>
            )}
          </div>

          {ladowanie && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Ładowanie...</div>}
          {!ladowanie && lista.length === 0 && (
            <div className="profil-card"><div className="profil-row"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Brak wpisów dla tego zjazdu.</span></div></div>
          )}

          {[1, 2].map(dzienNr => {
            const wpisDnia = lista.filter(o => o.dzien === dzienNr);
            if (wpisDnia.length === 0) return null;
            const data = dzienNr === 1 ? zjazd?.data_dzien1 : zjazd?.data_dzien2;
            const gStart = dzienNr === 1 ? zjazd?.godzina_start_d1 : zjazd?.godzina_start_d2;
            const gEnd = dzienNr === 1 ? zjazd?.godzina_end_d1 : zjazd?.godzina_end_d2;
            return (
              <div key={dzienNr} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-dark)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Dzień {dzienNr} {data ? `· ${new Date(data).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}
                  {gStart && gEnd && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> · {gStart}–{gEnd}</span>}
                </div>
                {wpisDnia.map(o => {
                  const kol = statusKolor(o.status);
                  return (
                    <div key={o.id} className="profil-card" style={{ marginBottom: '6px' }}>
                      <div className="profil-row">
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{o.imie} {o.nazwisko}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: kol.bg, color: kol.color }}>
                          {o.status === 'potwierdzono' ? '✓ Obecny/a' : '✕ Nieobecny/a'}
                        </span>
                      </div>
                      {o.powod_nieobecnosci && <div className="profil-row"><span className="profil-lbl">Powód</span><span className="profil-val" style={{ fontSize: '11px', fontStyle: 'italic' }}>{o.powod_nieobecnosci}</span></div>}
                      {(o.godzina_przybycia || o.godzina_wyjscia) && (
                        <div className="profil-row">
                          {o.godzina_przybycia && <span style={{ fontSize: '11px', color: '#c8a84b' }}>⏰ przybycie: {o.godzina_przybycia}</span>}
                          {o.godzina_wyjscia && <span style={{ fontSize: '11px', color: '#c8a84b' }}>⏰ wyjście: {o.godzina_wyjscia}</span>}
                        </div>
                      )}
                      <div className="profil-row">
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {o.zweryfikowano ? '✓ zweryfikowano' : 'niezweryfikowane'} · {new Date(o.confirmed_at).toLocaleString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
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
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>info@on-arch.pl | +48 533 718 412</p>
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
      <div className="login-logo"><OnArchLogo height={36} color="#7d3f3f" /></div>
      <div className="reset-success"><div className="reset-icon">✅</div><h3>Haslo zostalo zmienione!</h3><p>Mozesz teraz zalogowac sie nowym haslem.</p></div>
      <button className="login-btn" style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>Przejdz do logowania</button>
    </div></div>
  );

  return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo"><OnArchLogo height={36} color="#7d3f3f" /></div>
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
        <p style={{ marginBottom: '12px' }}><strong>Administrator danych osobowych:</strong><br />On-Arch Barbara Szczęsna-Dyńska<br />ul. Tymienieckiego 25D/53, 90-350 Łódź<br />Email: info@on-arch.pl</p>
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
        <p>info@on-arch.pl | +48 533 718 412</p>
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
        <p>On-Arch Barbara Szczęsna-Dyńska<br />ul. Tymienieckiego 25D/53, 90-350 Łódź<br />info@on-arch.pl | +48 533 718 412</p>
      </div>
    </div>
  );
}

function EkranPowitalny({ kursant, user, onDalej }: { kursant: Kursant; user: { id: string }; onDalej: () => void }) {
  const [ladowanie, setLadowanie] = useState(false);

  async function zakoncz() {
    setLadowanie(true);
    await supabase.from('kursanci').update({ onboarding_done: true }).eq('user_id', user.id);
    onDalej();
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--brand-dark)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 24px',
    }}>
      {/* Logo */}
      <OnArchLogo height={40} color="white" />
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px' }}>
        Akademia
      </div>

      {/* Powitanie */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '24px', fontWeight: 300, color: 'white', marginBottom: '12px', fontFamily: 'Cormorant Garamond, serif' }}>
          Witaj, {kursant.imie}! 👋
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', maxWidth: '300px' }}>
          Cieszymy się, że jesteś z nami. To Twoja przestrzeń na czas kursu projektowania wnętrz.
        </div>
      </div>

      {/* Placeholder na filmik */}
      <div style={{
        width: '100%', maxWidth: '320px', aspectRatio: '16/9',
        background: 'rgba(255,255,255,0.08)', borderRadius: '16px',
        border: '1px dashed rgba(255,255,255,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px', gap: '8px',
      }}>
        <div style={{ fontSize: '36px' }}>▶️</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0 16px' }}>
          Tutaj pojawi się filmik z omówieniem funkcji aplikacji
        </div>
      </div>

      {/* Co znajdziesz w aplikacji */}
      <div style={{ width: '100%', maxWidth: '320px', marginBottom: '32px' }}>
        {[
          { emoji: '📅', text: 'Plan zjazdów i potwierdzenie obecności' },
          { emoji: '📋', text: 'Zadania domowe i praca zaliczeniowa' },
          { emoji: '💬', text: 'Czat z kursantami Twojej grupy' },
          { emoji: '📢', text: 'Ogłoszenia i informacje od biura' },
          { emoji: '🎓', text: 'Certyfikat po ukończeniu kursu' },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '20px', flexShrink: 0 }}>{p.emoji}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{p.text}</div>
          </div>
        ))}
      </div>

      {/* Przycisk Dalej */}
      <button onClick={zakoncz} disabled={ladowanie} style={{
        width: '100%', maxWidth: '320px', padding: '16px',
        background: 'white', color: 'var(--brand-dark)',
        border: 'none', borderRadius: '16px', cursor: 'pointer',
        fontSize: '16px', fontWeight: 600, fontFamily: 'Jost, sans-serif',
        letterSpacing: '0.3px',
      }}>
        {ladowanie ? 'Ładowanie...' : 'Zaczynamy! →'}
      </button>
    </div>
  );
}

// Stała — wstaw Site Key z Cloudflare Turnstile gdy będzie gotowy
const TURNSTILE_SITE_KEY = '0x4AAAAAACty6p1M9mvVALXM';

const MAX_PROB = 5;
const BLOKADA_MINUT = 15;

function sprawdzBlokade(email: string): { zablokowany: boolean; pozostalo: number } {
  const klucz = `login_${email.toLowerCase()}`;
  const dane = localStorage.getItem(klucz);
  if (!dane) return { zablokowany: false, pozostalo: 0 };
  const { proby, czas } = JSON.parse(dane);
  const minuty = (Date.now() - czas) / 60000;
  if (proby >= MAX_PROB && minuty < BLOKADA_MINUT) {
    return { zablokowany: true, pozostalo: Math.ceil(BLOKADA_MINUT - minuty) };
  }
  if (minuty >= BLOKADA_MINUT) {
    localStorage.removeItem(klucz);
    return { zablokowany: false, pozostalo: 0 };
  }
  return { zablokowany: false, pozostalo: 0 };
}

function zapiszProbe(email: string, reset = false) {
  const klucz = `login_${email.toLowerCase()}`;
  if (reset) { localStorage.removeItem(klucz); return; }
  const dane = localStorage.getItem(klucz);
  const obecne = dane ? JSON.parse(dane) : { proby: 0, czas: Date.now() };
  const minuty = (Date.now() - obecne.czas) / 60000;
  if (minuty >= BLOKADA_MINUT) {
    localStorage.setItem(klucz, JSON.stringify({ proby: 1, czas: Date.now() }));
  } else {
    localStorage.setItem(klucz, JSON.stringify({ proby: obecne.proby + 1, czas: obecne.czas }));
  }
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
  const [pozostalePróby, setPozostalePróby] = useState(MAX_PROB);
  const [zablokowany, setZablokowany] = useState(false);
  const [pozostaloCzas, setPozostaloCzas] = useState(0);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileResetRef = useRef<HTMLDivElement>(null);
  const turnstileTokenRef = useRef<string>('');

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  // Renderuj widget na właściwym ekranie
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const ref = resetMode ? turnstileResetRef : turnstileRef;
    const init = () => {
      if ((window as any).turnstile && ref.current && !ref.current.hasChildNodes()) {
        (window as any).turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => { turnstileTokenRef.current = token; },
          'expired-callback': () => { turnstileTokenRef.current = ''; },
        });
      }
    };
    const timer = setTimeout(init, 300);
    return () => clearTimeout(timer);
  }, [resetMode]);

  // Odświeżaj timer blokady
  useEffect(() => {
    if (!email) return;
    const { zablokowany: z, pozostalo } = sprawdzBlokade(email);
    setZablokowany(z);
    setPozostaloCzas(pozostalo);
    if (!z) setPozostalePróby(MAX_PROB - ((() => {
      const dane = localStorage.getItem(`login_${email.toLowerCase()}`);
      return dane ? JSON.parse(dane).proby : 0;
    })()));
  }, [email]);

  useEffect(() => {
    if (!zablokowany) return;
    const interval = setInterval(() => {
      const { zablokowany: z, pozostalo } = sprawdzBlokade(email);
      setZablokowany(z);
      setPozostaloCzas(pozostalo);
      if (!z) setBlad('');
    }, 10000);
    return () => clearInterval(interval);
  }, [zablokowany, email]);

  async function zaloguj(e: React.FormEvent) {
    e.preventDefault();
    const { zablokowany: z, pozostalo } = sprawdzBlokade(email);
    if (z) { setBlad(`Zbyt wiele prób. Spróbuj ponownie za ${pozostalo} min.`); return; }
    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) { setBlad('Potwierdź że nie jesteś robotem.'); return; }
    setLadowanie(true); setBlad('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: haslo, options: { captchaToken: turnstileTokenRef.current || undefined } });
    if (error) {
      zapiszProbe(email);
      const { zablokowany: zNowy, pozostalo: pNowy } = sprawdzBlokade(email);
      const dane = localStorage.getItem(`login_${email.toLowerCase()}`);
      const proby = dane ? JSON.parse(dane).proby : 1;
      if (zNowy) {
        setZablokowany(true);
        setPozostaloCzas(pNowy);
        setBlad(`Zbyt wiele nieudanych prób. Konto tymczasowo zablokowane na ${BLOKADA_MINUT} minut.`);
      } else {
        const pozostale = MAX_PROB - proby;
        setPozostalePróby(pozostale);
        setBlad(`Nieprawidłowy email lub hasło.${pozostale <= 2 ? ` Pozostało prób: ${pozostale}.` : ''}`);
      }
      if (TURNSTILE_SITE_KEY && (window as any).turnstile) {
        (window as any).turnstile.reset();
        turnstileTokenRef.current = '';
      }
    } else {
      zapiszProbe(email, true);
      onZalogowano();
    }
    setLadowanie(false);
  }

  async function resetHasla(e: React.FormEvent) {
    e.preventDefault();
    setLadowanie(true); setBlad('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://on-arch-akademia.vercel.app' });
    if (error) {
      setBlad('Blad: ' + error.message);
      if (TURNSTILE_SITE_KEY && (window as any).turnstile) {
        (window as any).turnstile.reset();
        turnstileTokenRef.current = '';
      }
    } else { setResetWyslany(true); }
    setLadowanie(false);
  }

  if (pokazPolityka) return <EkranPolitykaPrywatnosci onWroc={() => setPokazPolityka(false)} />;
  if (pokazRegulamin) return <EkranRegulamin onWroc={() => setPokazRegulamin(false)} />;

  if (resetWyslany) return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo"><OnArchLogo height={36} color="#7d3f3f" /></div>
      <div className="reset-success"><div className="reset-icon">✉️</div><h3>Sprawdz skrzynke</h3><p>Wyslalismy link na adres <strong>{email}</strong></p></div>
      <button className="login-btn" style={{ marginTop: '20px' }} onClick={() => { setResetMode(false); setResetWyslany(false); }}>Wroce do logowania</button>
    </div></div>
  );

  if (resetMode) return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo"><OnArchLogo height={36} color="#7d3f3f" /></div>
      <p className="login-sub">Resetowanie hasla</p>
      <form className="login-form" onSubmit={resetHasla}>
        <div className="login-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" required /></div>
        {blad && <div className="login-error">{blad}</div>}
        {TURNSTILE_SITE_KEY && <div ref={turnstileResetRef} style={{ margin: '10px 0' }} />}
        <button className="login-btn" type="submit" disabled={ladowanie}>{ladowanie ? 'Wysylanie...' : 'Wyslij link resetujacy'}</button>
      </form>
      <button className="btn-link" onClick={() => setResetMode(false)}>Wroce do logowania</button>
    </div></div>
  );

  return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo"><OnArchLogo height={36} color="#7d3f3f" /></div>
      <p className="login-sub">Panel kursanta</p>
      <form className="login-form" onSubmit={zaloguj}>
        <div className="login-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl" required /></div>
        <div className="login-field"><label>Haslo</label><input type="password" value={haslo} onChange={e => setHaslo(e.target.value)} placeholder="password" required /></div>
        {blad && <div className="login-error">{blad}</div>}
        {zablokowany && (
          <div style={{ background: '#ffebee', border: '0.5px solid #ffcdd2', borderRadius: '10px', padding: '12px 14px', fontSize: '12px', color: '#c62828', lineHeight: 1.6, marginBottom: '8px' }}>
            🔒 Logowanie zablokowane na {pozostaloCzas} min. z powodu zbyt wielu nieudanych prób.
          </div>
        )}
        {!zablokowany && pozostalePróby < MAX_PROB && pozostalePróby > 0 && (
          <div style={{ fontSize: '11px', color: '#e57373', textAlign: 'center', marginBottom: '4px' }}>
            Pozostało prób: {pozostalePróby} z {MAX_PROB}
          </div>
        )}
        {TURNSTILE_SITE_KEY && <div ref={turnstileRef} style={{ margin: '10px 0' }} />}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0' }}>
          <input type="checkbox" id="zgoda" checked={zgodaRodo} onChange={e => setZgodaRodo(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--brand)' }} />
          <label htmlFor="zgoda" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Akceptuję <button type="button" className="btn-link" style={{ display: 'inline', fontSize: '12px' }} onClick={() => setPokazRegulamin(true)}>Regulamin</button> oraz <button type="button" className="btn-link" style={{ display: 'inline', fontSize: '12px' }} onClick={() => setPokazPolityka(true)}>Politykę Prywatności</button>
          </label>
        </div>
        <button className="login-btn" type="submit" disabled={ladowanie || !zgodaRodo || zablokowany}>{ladowanie ? 'Logowanie...' : 'Zaloguj sie'}</button>
      </form>
      <button className="btn-link" onClick={() => setResetMode(true)}>Nie pamietasz hasla?</button>
      <div style={{ marginTop: '20px', background: 'var(--brand-light)', borderRadius: '14px', padding: '14px 16px', textAlign: 'left' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Nie masz dostępu?</div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '10px' }}>
          Dostęp do aplikacji mają wyłącznie kursanci zapisani przez biuro On-Arch. Jeśli jesteś kursantem i nie możesz się zalogować — skontaktuj się z nami:
        </p>
        <a href="tel:+48533718412" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--brand-dark)', textDecoration: 'none', marginBottom: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.64 4.89 2 2 0 0 1 3.61 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18z"/></svg>
          +48 533 718 412
        </a>
        <a href="mailto:info@on-arch.pl" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--brand-dark)', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          info@on-arch.pl
        </a>
      </div>
    </div></div>
  );
}

function EkranCzat({ user, kursant }: { user: User; kursant: Kursant | null }) {
  const [wiadomosci, setWiadomosci] = useState<Wiadomosc[]>([]);
  const [avatary, setAvatary] = useState<Record<string, { avatar_url: string | null; imie: string }>>({});
  const [nowa, setNowa] = useState('');
  const [wysylanie, setWysylanie] = useState(false);
  const [pokazEmoji, setPokazEmoji] = useState(false);
  const doRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kursant?.grupa_id) return;

    // Pobierz avatary wszystkich kursantów grupy
    supabase.from('kursanci').select('user_id, imie, avatar_url').eq('grupa_id', kursant.grupa_id)
      .then(({ data }) => {
        const map: Record<string, { avatar_url: string | null; imie: string }> = {};
        (data || []).forEach((k: any) => { map[k.user_id] = { avatar_url: k.avatar_url, imie: k.imie }; });
        setAvatary(map);
      });

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

  // Grupuj wiadomości — ukryj avatar jeśli kolejna wiadomość od tej samej osoby
  const pokazAvatar = (idx: number) => {
    const w = wiadomosci[idx];
    const next = wiadomosci[idx + 1];
    return !next || next.user_id !== w.user_id;
  };

  return (
    <div className="czat-container">
      <h2 className="page-title">Czat grupy</h2>
      <div className="czat-nazwa">{kursant.grupy?.nazwa || 'Twoja grupa'}</div>
      <div className="czat-wiadomosci">
        {wiadomosci.length === 0 && <div className="czat-puste">Brak wiadomosci. Napisz pierwsza!</div>}
        {wiadomosci.map((w, idx) => {
          const moja = w.user_id === user.id;
          const info = avatary[w.user_id];
          const czyPokazac = pokazAvatar(idx);
          const poprzedniaTaSama = idx > 0 && wiadomosci[idx - 1].user_id === w.user_id;

          return (
            <div key={w.id} style={{ marginBottom: czyPokazac ? '10px' : '2px', display: 'flex', flexDirection: 'column', alignItems: moja ? 'flex-end' : 'flex-start' }}>
              {/* Imię — tylko pierwsza wiadomość z serii */}
              {!moja && !poprzedniaTaSama && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', paddingLeft: '32px' }}>{w.imie}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: moja ? 'row-reverse' : 'row' }}>
                {/* Avatar — tylko cudze, tylko ostatnia w serii */}
                {!moja && (
                  <div style={{ width: '24px', flexShrink: 0 }}>
                    {czyPokazac ? (
                      info?.avatar_url
                        ? <img src={info.avatar_url} alt={w.imie} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        : <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand-light)', border: '1px solid var(--brand-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--brand-dark)' }}>{w.imie?.[0]?.toUpperCase()}</div>
                    ) : <div style={{ width: '24px' }} />}
                  </div>
                )}
                {/* Bąbelka */}
                <div style={{
                  maxWidth: '240px',
                  padding: '9px 14px',
                  borderRadius: '18px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                  background: moja ? 'var(--brand)' : 'var(--surface)',
                  color: moja ? 'white' : 'var(--text)',
                  border: moja ? 'none' : '0.5px solid var(--border)',
                  borderBottomRightRadius: moja ? '4px' : '18px',
                  borderBottomLeftRadius: moja ? '18px' : '4px',
                }}>{w.tekst}</div>
              </div>
              {/* Czas — tylko ostatnia w serii */}
              {czyPokazac && (
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px', paddingRight: moja ? '2px' : '0', paddingLeft: moja ? '0' : '32px' }}>
                  {new Date(w.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          );
        })}
        <div ref={doRef} />
      </div>
      <div style={{ position: 'relative' }}>
        {pokazEmoji && (
          <div style={{
            position: 'absolute', bottom: '48px', left: 0,
            background: 'white', borderRadius: '16px', padding: '10px',
            border: '0.5px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex', flexWrap: 'wrap', gap: '4px', width: '240px', zIndex: 100,
          }}>
            {['😊','😂','❤️','👍','🙏','😍','🤩','😘','😅','🥹','😭','😤','🤔','💪','🎉','✨','🔥','💡','📝','✅','❌','⭐','🏠','📐','🎨','🖼️','💼','📅','🗓️','📌'].map(e => (
              <button key={e} type="button" onClick={() => { setNowa(prev => prev + e); setPokazEmoji(false); }}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '2px', borderRadius: '6px', lineHeight: 1 }}>
                {e}
              </button>
            ))}
          </div>
        )}
        <form className="czat-form" onSubmit={wyslij}>
          <button type="button" onClick={() => setPokazEmoji(p => !p)}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '0 4px', flexShrink: 0, opacity: 0.7 }}>
            😊
          </button>
          <input className="czat-input" type="text" value={nowa} onChange={e => setNowa(e.target.value)} placeholder="Napisz wiadomosc..." disabled={wysylanie} maxLength={500} />
          <button className="czat-btn" type="submit" disabled={wysylanie || !nowa.trim()}>➤</button>
        </form>
      </div>
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
  const [komunikat, setKomunikat] = useState('');
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
      supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url').eq('rola', 'kursant').in('grupa_id', grupyIds),
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
    <div className="biuro-shell">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="biuro-sidebar">
        <div className="biuro-sidebar-logo">
          <OnArchLogo height={24} color="var(--brand-dark)" />
          <span className="biuro-sidebar-role">Prowadzący</span>
        </div>
        <nav className="biuro-sidebar-nav">
          {[
            { id: 'zadania',   icon: <BookOpen size={18}/>,    label: 'Zadania' },
            { id: 'zjazdy',    icon: <Calendar size={18}/>,    label: 'Zjazdy' },
            { id: 'obecnosc',  icon: <CheckSquare size={18}/>, label: 'Obecność' },
            { id: 'kursanci',  icon: <User size={18}/>,        label: 'Kursanci' },
            { id: 'ogloszenia',icon: <Bell size={18}/>,        label: 'Ogłoszenia' },
          ].map(item => (
            <button key={item.id}
              className={`biuro-sidebar-item ${aktywnaZakladka === item.id ? 'active' : ''}`}
              onClick={() => setAktywnaZakladka(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onWyloguj} className="biuro-sidebar-wyloguj">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Wyloguj
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="biuro-content">
        <header className="biuro-mobile-header">
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}><OnArchLogo height={20} color="var(--brand-dark)" /><span style={{fontSize:'10px',opacity:0.6}}>Prowadzący</span></div>
          <button onClick={onWyloguj} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '13px', cursor: 'pointer' }}>Wyloguj</button>
        </header>
        <div className="biuro-page-header">
          <div className="biuro-page-title">
            {aktywnaZakladka === 'zadania' && 'Zadania'}
            {aktywnaZakladka === 'zjazdy' && 'Zjazdy'}
            {aktywnaZakladka === 'obecnosc' && 'Obecność'}
            {aktywnaZakladka === 'kursanci' && 'Kursanci'}
            {aktywnaZakladka === 'ogloszenia' && 'Ogłoszenia'}
          </div>
        </div>
        <main className="biuro-main">
          {komunikat && <div className="login-error" style={{ background: '#e8f5e9', color: '#2e7d32', marginBottom: '12px' }}>{komunikat}</div>}
          {ladowanie && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Ładowanie...</div>}
          {!ladowanie && !mojeProwadzacyId && (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Twoje konto nie jest powiązane z profilem prowadzącego.<br />Skontaktuj się z biurem.</p>
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
                  {mojeGrupy.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <button onClick={() => setWybranaGrupa('')}
                        style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: !wybranaGrupa ? 'var(--brand)' : 'white', color: !wybranaGrupa ? 'white' : 'var(--text)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                        Wszystkie
                      </button>
                      {mojeGrupy.map(g => (
                        <button key={g.id} onClick={() => setWybranaGrupa(String(g.id))}
                          style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: wybranaGrupa === String(g.id) ? 'var(--brand)' : 'white', color: wybranaGrupa === String(g.id) ? 'white' : 'var(--text)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                          {g.nazwa}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* Formularz */}
                    <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', minWidth: '260px', flex: '1' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Nowe zadanie</div>
                      <form onSubmit={dodajZadanie}>
                        <select value={noweZadanie.grupa_id} onChange={e => setNoweZadanie({ ...noweZadanie, grupa_id: e.target.value })} required
                          style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white', marginBottom: '8px' }}>
                          <option value="">Wybierz grupę *</option>
                          {mojeGrupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                        </select>
                        <input type="text" value={noweZadanie.tytul} onChange={e => setNoweZadanie({ ...noweZadanie, tytul: e.target.value })} placeholder="Tytuł zadania *" required
                          style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                        <textarea value={noweZadanie.opis} onChange={e => setNoweZadanie({ ...noweZadanie, opis: e.target.value })} placeholder="Opis / instrukcja" rows={3}
                          style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input type="date" value={noweZadanie.termin} onChange={e => setNoweZadanie({ ...noweZadanie, termin: e.target.value })}
                            style={{ flex: 1, fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }} />
                          <select value={noweZadanie.typ} onChange={e => setNoweZadanie({ ...noweZadanie, typ: e.target.value })}
                            style={{ flex: 1, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                            <option value="zadanie">Zadanie domowe</option>
                            <option value="praca_zaliczeniowa">Praca zaliczeniowa</option>
                          </select>
                        </div>
                        <input type="url" value={noweZadanie.link_materialow} onChange={e => setNoweZadanie({ ...noweZadanie, link_materialow: e.target.value })} placeholder="Link do materiałów (opcjonalnie)"
                          style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                        <button type="submit" style={{ width: '100%', padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                          + Dodaj zadanie
                        </button>
                      </form>
                    </div>
                    {/* Lista */}
                    <div style={{ flex: '2', minWidth: '280px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
                        Lista zadań ({zadania.filter(z => !wybranaGrupa || z.grupa_id === parseInt(wybranaGrupa)).length})
                      </div>
                      {zadania.filter(z => !wybranaGrupa || z.grupa_id === parseInt(wybranaGrupa)).map(z => {
                        const odp = odpowiedziZadan.filter(o => o.zadanie_id === z.id);
                        const grupa = mojeGrupy.find(g => g.id === z.grupa_id);
                        return (
                          <div key={z.id} style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', marginBottom: '8px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{z.tytul}</span>
                                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '8px',
                                    background: z.typ === 'praca_zaliczeniowa' ? '#fef9ec' : 'var(--brand-light)',
                                    color: z.typ === 'praca_zaliczeniowa' ? '#c8a84b' : 'var(--brand-dark)' }}>
                                    {z.typ === 'praca_zaliczeniowa' ? '⭐ Zaliczenie' : 'Zadanie'}
                                  </span>
                                  {mojeGrupy.length > 1 && grupa && (
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg)', padding: '1px 6px', borderRadius: '6px', border: '0.5px solid var(--border)' }}>{grupa.nazwa}</span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                                  {z.termin && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📅 {new Date(z.termin).toLocaleDateString('pl-PL')}</span>}
                                  {z.link_materialow && <a href={z.link_materialow} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--brand)', textDecoration: 'none' }}>📎 Materiały</a>}
                                </div>
                                {z.opis && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>{z.opis}</div>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '8px',
                                  background: odp.length > 0 ? '#e8f5e9' : 'var(--bg)', color: odp.length > 0 ? '#2e7d32' : 'var(--text-muted)' }}>
                                  {odp.length} prac
                                </span>
                                <button onClick={() => usunZadanie(z.id)} style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px', padding: '0' }}>×</button>
                              </div>
                            </div>
                            {odp.length > 0 && (
                              <div style={{ borderTop: '0.5px solid var(--border-soft)', background: 'var(--bg)' }}>
                                {odp.map((o, oi) => (
                                  <div key={o.id} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', padding: '8px 14px', borderBottom: oi < odp.length - 1 ? '0.5px solid var(--border-soft)' : 'none', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', minWidth: '120px' }}>{o.imie} {o.nazwisko}</span>
                                    <a href={o.link_pracy} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>→ Otwórz pracę</a>
                                    {o.komentarz && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{o.komentarz}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {zadania.filter(z => !wybranaGrupa || z.grupa_id === parseInt(wybranaGrupa)).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Brak zadań</div>
                      )}
                    </div>
                  </div>
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
                              <span className="profil-lbl">{k.imie} {k.nazwisko}</span>
                              <span style={{ fontSize: '12px', color: 'var(--brand)' }}>{otwarta ? '▲' : '▼'}</span>
                            </div>
                            {otwarta && (
                              <div style={{ padding: '8px 16px 12px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Notatka prywatna 🔒</label>
                                <textarea value={trescNotatki} onChange={e => setTrescNotatki(e.target.value)} rows={3} placeholder="Notatka widoczna tylko dla Ciebie…"
                                  style={{ width: '100%', fontSize: '13px', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                  <button onClick={() => zapiszNotatke(k.user_id)} className="login-btn" style={{ flex: 1, padding: '8px' }}>Zapisz notatkę</button>
                                  {notatka && <button onClick={() => usunNotatke(k.user_id)} className="btn-wyloguj" style={{ flex: 1, padding: '8px', marginTop: 0 }}>Usuń notatkę</button>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
              {aktywnaZakladka === 'zjazdy' && (
                <>
                  <h2 className="page-title">Moje zjazdy</h2>
                  {zjazdy.map(z => (
                    <div key={z.id} className="profil-card" style={{ marginBottom: '8px' }}>
                      <div className="profil-row">
                        <span className="profil-lbl" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px' }}>Zjazd {z.nr} — {z.daty}</span>
                        <span className={`s-badge s-${z.status}`}>{z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}</span>
                      </div>
                      <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{mojeGrupy.find(g => g.id === z.grupa_id)?.nazwa || '-'}</span></div>
                      {z.typ === 'online' ? (
                        <div className="profil-row"><span className="profil-lbl">🌐 Online</span>{z.link_online && <a href={z.link_online} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand)' }}>Dołącz →</a>}</div>
                      ) : (
                        z.sala && <div className="profil-row"><span className="profil-lbl">Sala</span><span className="profil-val">{z.sala}</span></div>
                      )}
                    </div>
                  ))}
                </>
              )}
              {aktywnaZakladka === 'ogloszenia' && (
                <>
                  {aktywneOgloszenie ? (
                    <EkranSzczegoly o={aktywneOgloszenie} onWroc={() => setAktywneOgloszenie(null)} />
                  ) : (
                    <div>{ogloszenia.map(o => <KartaOgloszenia key={o.id} o={o} onClick={() => setAktywneOgloszenie(o)} />)}</div>
                  )}
                </>
              )}
              {aktywnaZakladka === 'obecnosc' && (
                <WeryfikacjaObecnosci zjazdy={zjazdy} grupy={mojeGrupy} kursanci={kursanci} prowadzacyUserId={user.id} />
              )}
            </>
          )}
        </main>
        <nav className="bottom-nav biuro-mobile-nav">
          <button className={`nav-item ${aktywnaZakladka === 'zadania' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('zadania')}><BookOpen size={20} /><span className="nav-label">Zadania</span></button>
          <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('zjazdy')}><Calendar size={20} /><span className="nav-label">Zjazdy</span></button>
          <button className={`nav-item ${aktywnaZakladka === 'obecnosc' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('obecnosc')}><CheckSquare size={20} /><span className="nav-label">Obecność</span></button>
          <button className={`nav-item ${aktywnaZakladka === 'kursanci' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('kursanci')}><User size={20} /><span className="nav-label">Kursanci</span></button>
          <button className={`nav-item ${aktywnaZakladka === 'ogloszenia' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('ogloszenia')}><Bell size={20} /><span className="nav-label">Ogłoszenia</span></button>
        </nav>
      </div>
    </div>
  );
}


// ─── WERYFIKACJA OBECNOŚCI (prowadzący) ──────────────────────────────────────

function WeryfikacjaObecnosci({ zjazdy, grupy, kursanci, prowadzacyUserId }: {
  zjazdy: Zjazd[];
  grupy: Grupa[];
  kursanci: KursantAdmin[];
  prowadzacyUserId: string;
}) {
  const [wybranyZjazd, setWybranyZjazd] = useState('');
  const [obecnosci, setObecnosci] = useState<Obecnosc[]>([]);
  const [ladowanie, setLadowanie] = useState(false);
  const [wybranaGrupa, setWybranaGrupa] = useState('');
  const [aktywneGodziny, setAktywneGodziny] = useState<string | null>(null); // "id_dzien"
  const [godz, setGodz] = useState({ przybycie: '', wyjscie: '' });

  const zjazdyFiltr = wybranaGrupa ? zjazdy.filter(z => z.grupa_id === parseInt(wybranaGrupa)) : zjazdy;

  useEffect(() => {
    if (!wybranyZjazd) { setObecnosci([]); return; }
    setLadowanie(true);
    supabase.from('obecnosci').select('*').eq('zjazd_id', parseInt(wybranyZjazd))
      .then(({ data }) => { setObecnosci(data || []); setLadowanie(false); });
  }, [wybranyZjazd]);

  async function odswiezObecnosci() {
    const { data } = await supabase.from('obecnosci').select('*').eq('zjazd_id', parseInt(wybranyZjazd));
    setObecnosci(data || []);
  }

  async function zweryfikuj(obecnoscId: string, weryfikuj: boolean) {
    await supabase.from('obecnosci').update({
      zweryfikowano: weryfikuj,
      zweryfikowano_przez: weryfikuj ? prowadzacyUserId : null,
    }).eq('id', obecnoscId);
    await odswiezObecnosci();
  }

  async function zapiszGodziny(obecnoscId: string) {
    await supabase.from('obecnosci').update({
      godzina_przybycia: godz.przybycie || null,
      godzina_wyjscia: godz.wyjscie || null,
    }).eq('id', obecnoscId);
    await odswiezObecnosci();
    setAktywneGodziny(null);
    setGodz({ przybycie: '', wyjscie: '' });
  }

  async function dodajRecznieObecnosc(kursantUserId: string, imie: string, nazwisko: string, dzien: 1 | 2, zjazdId: number) {
    const zjazd = zjazdy.find(z => z.id === zjazdId);
    if (!zjazd) return;
    await supabase.from('obecnosci').upsert([{
      zjazd_id: zjazdId, user_id: kursantUserId,
      grupa_id: zjazd.grupa_id, imie, nazwisko, dzien,
      status: 'potwierdzono', zweryfikowano: true, zweryfikowano_przez: prowadzacyUserId,
    }], { onConflict: 'zjazd_id,user_id,dzien' });
    await odswiezObecnosci();
  }

  const zjazd = zjazdy.find(z => z.id === parseInt(wybranyZjazd));
  const kursanciZjazdu = zjazd ? kursanci.filter(k => k.grupa_id === zjazd.grupa_id) : [];

  return (
    <>
      <h2 className="page-title">Weryfikacja obecności</h2>

      {grupy.length > 1 && (
        <div className="login-field" style={{ marginBottom: '10px' }}>
          <label>Grupa</label>
          <select value={wybranaGrupa} onChange={e => { setWybranaGrupa(e.target.value); setWybranyZjazd(''); }}>
            <option value="">Wszystkie grupy</option>
            {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
          </select>
        </div>
      )}

      <div className="login-field" style={{ marginBottom: '16px' }}>
        <label>Zjazd</label>
        <select value={wybranyZjazd} onChange={e => setWybranyZjazd(e.target.value)}>
          <option value="">Wybierz zjazd</option>
          {zjazdyFiltr.map(z => <option key={z.id} value={z.id}>Zjazd {z.nr} — {z.daty}</option>)}
        </select>
      </div>

      {wybranyZjazd && ladowanie && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Ładowanie...</div>}

      {wybranyZjazd && !ladowanie && (
        <>
          {[1, 2].filter(dzienNr => dzienNr === 1 || zjazd?.data_dzien2).map(dzienNr => {
            const data = dzienNr === 1 ? zjazd?.data_dzien1 : zjazd?.data_dzien2;
            const gStart = dzienNr === 1 ? zjazd?.godzina_start_d1 : zjazd?.godzina_start_d2;
            const gEnd = dzienNr === 1 ? zjazd?.godzina_end_d1 : zjazd?.godzina_end_d2;
            return (
              <div key={dzienNr} style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--brand)', marginBottom: '4px' }}>
                  Dzień {dzienNr}
                  {data && ` · ${new Date(data).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                </h3>
                {gStart && gEnd && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>Godziny zajęć: {gStart}–{gEnd}</div>}
                {!gStart && <div style={{ marginBottom: '10px' }} />}

                {kursanciZjazdu.map(k => {
                  const wpis = obecnosci.find(o => o.user_id === k.user_id && o.dzien === dzienNr);
                  const kluczGodzin = `${k.user_id}_${dzienNr}`;
                  const godzinaAktywna = aktywneGodziny === kluczGodzin;
                  // Edycja możliwa tylko w dniu zajęć
                  const dzisiaj = new Date().toISOString().split('T')[0];
                  const moznaEdytowac = data === dzisiaj;
                  return (
                    <div key={k.id} className="profil-card" style={{ marginBottom: '6px' }}>
                      <div className="profil-row">
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{k.imie} {k.nazwisko}</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {!wpis && moznaEdytowac && (
                            <button onClick={() => dodajRecznieObecnosc(k.user_id, k.imie, k.nazwisko, dzienNr as 1 | 2, parseInt(wybranyZjazd))}
                              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: '#e8f5e9', color: '#2e7d32', border: '0.5px solid #c8e6c9', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                              + Dodaj
                            </button>
                          )}
                          {!wpis && !moznaEdytowac && (
                            <span style={{ fontSize: '10px', color: '#bbb' }}>—</span>
                          )}
                          {wpis && (
                            <>
                              <span style={{
                                fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
                                background: wpis.status === 'potwierdzono' ? '#e8f5e9' : '#ffebee',
                                color: wpis.status === 'potwierdzono' ? '#2e7d32' : '#c62828',
                              }}>
                                {wpis.status === 'potwierdzono' ? '✓ Obecny/a' : '✕ Nieobecny/a'}
                              </span>
                              {wpis.zweryfikowano ? (
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>✓ zweryfikowano</span>
                              ) : (
                                <button onClick={() => zweryfikuj(wpis.id, true)}
                                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: 'var(--brand-light)', color: 'var(--brand)', border: '0.5px solid var(--brand-mid)', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                                  Zweryfikuj
                                </button>
                              )}
                              {wpis.status === 'potwierdzono' && (
                                <button onClick={() => {
                                  setAktywneGodziny(godzinaAktywna ? null : kluczGodzin);
                                  setGodz({ przybycie: wpis.godzina_przybycia || '', wyjscie: wpis.godzina_wyjscia || '' });
                                }}
                                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: '#fef9ec', color: '#c8a84b', border: '0.5px solid #f0d080', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                                  🕐 Spóźnienie
                                </button>
                              )}
                              {moznaEdytowac && (
                                <button onClick={async () => {
                                  const nowyStatus = wpis.status === 'potwierdzono' ? 'nieobecnosc' : 'potwierdzono';
                                  await supabase.from('obecnosci').update({ status: nowyStatus, zweryfikowano: false, zweryfikowano_przez: null }).eq('id', wpis.id);
                                  await odswiezObecnosci();
                                }}
                                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: '#f5f5f5', color: 'var(--text-muted)', border: '0.5px solid var(--border)', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                                  {wpis.status === 'potwierdzono' ? '↩ Nieobecność' : '↩ Obecność'}
                                </button>
                              )}
                              {moznaEdytowac && (
                                <button onClick={async () => {
                                  if (window.confirm(`Usunąć wpis dla ${k.imie} ${k.nazwisko}?`)) {
                                    await supabase.from('obecnosci').delete().eq('id', wpis.id);
                                    await odswiezObecnosci();
                                  }
                                }}
                                  style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '8px', background: '#ffebee', color: '#c62828', border: '0.5px solid #ffcdd2', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                                  ×
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {wpis?.powod_nieobecnosci && (
                        <div style={{ padding: '0 16px 6px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Powód: {wpis.powod_nieobecnosci}
                        </div>
                      )}

                      {/* Godziny spóźnienia/wyjścia */}
                      {wpis && (wpis.godzina_przybycia || wpis.godzina_wyjscia) && !godzinaAktywna && (
                        <div style={{ padding: '0 16px 6px', display: 'flex', gap: '12px' }}>
                          {wpis.godzina_przybycia && <span style={{ fontSize: '11px', color: '#c8a84b' }}>⏰ przybycie: {wpis.godzina_przybycia}</span>}
                          {wpis.godzina_wyjscia && <span style={{ fontSize: '11px', color: '#c8a84b' }}>⏰ wyjście: {wpis.godzina_wyjscia}</span>}
                        </div>
                      )}

                      {/* Formularz godzin */}
                      {godzinaAktywna && wpis && (
                        <div style={{ padding: '0 16px 12px' }}>
                          <div style={{ background: '#fef9ec', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Spóźnienie / wczesne wyjście</div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>Przybycie</div>
                                <input type="time" value={godz.przybycie} onChange={e => setGodz(g => ({ ...g, przybycie: e.target.value }))}
                                  style={{ width: '100%', fontSize: '12px', padding: '5px 8px', borderRadius: '8px', border: '0.5px solid var(--border)' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>Wyjście</div>
                                <input type="time" value={godz.wyjscie} onChange={e => setGodz(g => ({ ...g, wyjscie: e.target.value }))}
                                  style={{ width: '100%', fontSize: '12px', padding: '5px 8px', borderRadius: '8px', border: '0.5px solid var(--border)' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => zapiszGodziny(wpis.id)}
                                className="login-btn" style={{ flex: 1, marginTop: 0, padding: '8px' }}>
                                Zapisz
                              </button>
                              <button onClick={() => setAktywneGodziny(null)}
                                style={{ padding: '8px 12px', borderRadius: '10px', background: 'white', border: '0.5px solid var(--border)', fontSize: '12px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                Anuluj
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {kursanciZjazdu.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Brak kursantów w tej grupie.</p>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

function PanelBiura({ onWyloguj }: { onWyloguj: () => void }) {
  const [aktywnaZakladka, setAktywnaZakladka] = useState('home');
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
  const [nowyZjazd, setNowyZjazd] = useState({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', typ: 'stacjonarny', link_online: '', data_zjazdu: '', data_dzien1: '', data_dzien2: '', grupa_id: '', prowadzacy_id: '' });

  type WierszZjazdu = {
    _id: string;
    nr: string; data_dzien1: string; data_dzien2: string;
    godzina_start_d1: string; godzina_end_d1: string;
    sala: string; adres: string; tematy: string;
    prowadzacy_id: string; typ: string; link_online: string;
  };
  const pustyWiersz = (typ = 'stacjonarny'): WierszZjazdu => ({
    _id: Math.random().toString(36).slice(2),
    nr: '', data_dzien1: '', data_dzien2: '',
    godzina_start_d1: '', godzina_end_d1: '',
    sala: '', adres: '', tematy: '',
    prowadzacy_id: '', typ, link_online: '',
  });
  const [tabelaZjazdow, setTabelaZjazdow] = useState<WierszZjazdu[]>([pustyWiersz(), pustyWiersz(), pustyWiersz()]);
  const [tabelaGrupa, setTabelaGrupa] = useState('');
  const [widokZjazdow, setWidokZjazdow] = useState<'tabela' | 'kalendarz'>('tabela');
  const [kalFiltrGrupa, setKalFiltrGrupa] = useState('');
  const [kalFiltrProwadzacy, setKalFiltrProwadzacy] = useState('');
  const [zwinieteGrupy, setZwinieteGrupy] = useState<Set<number>>(new Set());
  const [zwinieteZjazdy, setZwinieteZjazdy] = useState<Set<number>>(new Set());
  const [zwinieteZadania, setZwinieteZadania] = useState<Set<number>>(new Set());
  const [edytowanyKursant, setEdytowanyKursant] = useState<{ id: number; imie: string; nazwisko: string; email: string; telefon: string } | null>(null);
  const [szukajKursant, setSzukajKursant] = useState('');
  const [dostepnoscData, setDostepnoscData] = useState('');
  const [filtrMiastoProw, setFiltrMiastoProw] = useState('');
  const [filtrDostepnoscProw, setFiltrDostepnoscProw] = useState('');
  const [rozwinietaProwadzacy, setRozwinietaProwadzacy] = useState<Set<number>>(new Set());
  const [kalMiesiac, setKalMiesiac] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; });
  const [tabelaZapis, setTabelaZapis] = useState(false);
  const [tabelaWyniki, setTabelaWyniki] = useState<{ nr: string; status: string }[]>([]);
  const [pokazInstrukcjePaste, setPokazInstrukcjePaste] = useState(false);

  function wklejZExcela(tekst: string) {
    const wiersze = tekst.trim().split('\n').filter(r => r.trim());
    // Pomiń nagłówek jeśli pierwsza kolumna nie jest liczbą
    const start = isNaN(parseInt(wiersze[0]?.split('\t')[0])) ? 1 : 0;
    const nowe: WierszZjazdu[] = wiersze.slice(start).map(row => {
      const kol = row.split('\t').map(c => c.trim().replace(/"/g, ''));
      // Kolumny: Nr | Data D1 | Data D2 | Godz. start | Godz. koniec | Typ | Sala/Link | Adres | Temat
      const parseData = (s: string) => {
        if (!s) return '';
        // Obsługa formatu DD.MM.YYYY lub YYYY-MM-DD
        if (s.includes('.')) {
          const [d, m, y] = s.split('.');
          return `${y}-${m?.padStart(2,'0')}-${d?.padStart(2,'0')}`;
        }
        return s;
      };
      return {
        _id: Math.random().toString(36).slice(2),
        nr: kol[0] || '',
        data_dzien1: parseData(kol[1] || ''),
        data_dzien2: parseData(kol[2] || ''),
        godzina_start_d1: kol[3] || '',
        godzina_end_d1: kol[4] || '',
        typ: (kol[5] || '').toLowerCase().includes('online') ? 'online' : 'stacjonarny',
        sala: kol[6] || '',
        link_online: (kol[5] || '').toLowerCase().includes('online') ? (kol[6] || '') : '',
        adres: kol[7] || '',
        tematy: kol[8] || '',
        prowadzacy_id: '',
      };
    }).filter(w => w.nr);
    if (nowe.length > 0) setTabelaZjazdow(nowe);
  }
  const [nowyKursant, setNowyKursant] = useState({ imie: '', nazwisko: '', email: '', grupa_id: '' });
  const [nowaGrupa, setNowaGrupa] = useState({ nazwa: '', miasto: '', edycja: '', drive_link: '', numer_uslugi: '', tryb: 'stacjonarny' });
  const [nowyProwadzacy, setNowyProwadzacy] = useState({ imie: '', nazwisko: '', bio: '', avatar_url: '', email: '', telefon: '', notatki: '', miasto: '' });
  const [noweZadanie, setNoweZadanie] = useState({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: '', typ: 'zadanie' });
  const [komunikat, setKomunikat] = useState('');
  const [importStatus, setImportStatus] = useState<{ imie: string; nazwisko: string; email: string; status: string }[]>([]);
  const [importowanie, setImportowanie] = useState(false);
  const [wybranaGrupaAnkiety, setWybranaGrupaAnkiety] = useState('');
  const [wybranaGrupaZadan, setWybranaGrupaZadan] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pobierzGrupy(); pobierzOgloszenia(); pobierzZjazdy(); pobierzProwadzacy(); pobierzZadania();
    supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url').then(({ data }) => setKursanci((data || []) as unknown as KursantAdmin[]));
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


  async function zapiszTabelaZjazdow() {
    if (!tabelaGrupa) { setKomunikat('Wybierz grupę przed zapisem.'); return; }
    const wiersze = tabelaZjazdow.filter(w => w.nr && w.data_dzien1);
    if (wiersze.length === 0) { setKomunikat('Wypełnij co najmniej jeden wiersz (Nr + Data D1).'); return; }
    setTabelaZapis(true); setTabelaWyniki([]);
    const wyniki: { nr: string; status: string }[] = [];
    for (const w of wiersze) {
      const daty = w.data_dzien1 && w.data_dzien2
        ? `${new Date(w.data_dzien1).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' })}–${new Date(w.data_dzien2).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', year: 'numeric' })}`
        : new Date(w.data_dzien1).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', year: 'numeric' });
      const { data: nowy, error } = await supabase.from('zjazdy').insert([{
        nr: parseInt(w.nr),
        daty,
        sala: w.typ === 'online' ? '' : w.sala,
        adres: w.typ === 'online' ? '' : w.adres,
        tematy: w.tematy,
        status: 'nadchodzacy',
        typ: w.typ || 'stacjonarny',
        link_online: w.typ === 'online' ? w.link_online || null : null,
        data_zjazdu: w.data_dzien1,
        data_dzien1: w.data_dzien1 || null,
        data_dzien2: w.data_dzien2 || null,
        godzina_start_d1: w.godzina_start_d1 || null,
        godzina_end_d1: w.godzina_end_d1 || null,
        godzina_start_d2: w.godzina_start_d1 || null,
        godzina_end_d2: w.godzina_end_d1 || null,
        grupa_id: parseInt(tabelaGrupa),
      }]).select().single();
      if (error) {
        wyniki.push({ nr: w.nr, status: '✕ Błąd: ' + error.message });
      } else {
        if (w.prowadzacy_id && nowy) {
          await supabase.from('zjazdy_prowadzacy').insert([{ zjazd_id: nowy.id, prowadzacy_id: parseInt(w.prowadzacy_id) }]);
        }
        wyniki.push({ nr: w.nr, status: '✓ Dodano' });
      }
    }
    setTabelaWyniki(wyniki);
    setTabelaZapis(false);
    pobierzZjazdy();
    // Reset wypełnionych wierszy
    setTabelaZjazdow([pustyWiersz(), pustyWiersz(), pustyWiersz()]);
    setKomunikat(`Zapisano ${wyniki.filter(w => w.status.startsWith('✓')).length} z ${wyniki.length} zjazdów.`);
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
      typ: (edytowanyZjazd as any).typ || 'stacjonarny',
      link_online: (edytowanyZjazd as any).link_online || null,
      data_zjazdu: edytowanyZjazd.data_zjazdu,
      data_dzien1: edytowanyZjazd.data_dzien1 || null,
      data_dzien2: edytowanyZjazd.data_dzien2 || null,
      godzina_start_d1: (edytowanyZjazd as any).godzina_start_d1 || null,
      godzina_end_d1: (edytowanyZjazd as any).godzina_end_d1 || null,
      godzina_start_d2: (edytowanyZjazd as any).godzina_start_d2 || null,
      godzina_end_d2: (edytowanyZjazd as any).godzina_end_d2 || null,
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
      bio: nowyProwadzacy.bio || null,
      avatar_url: nowyProwadzacy.avatar_url || null,
      email: nowyProwadzacy.email || null,
      telefon: nowyProwadzacy.telefon || null,
      notatki: nowyProwadzacy.notatki || null,
      miasto: nowyProwadzacy.miasto || null,
    }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Prowadzący dodany!'); setNowyProwadzacy({ imie: '', nazwisko: '', bio: '', avatar_url: '', email: '', telefon: '', notatki: '', miasto: '' }); pobierzProwadzacy(); }
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
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Kursant dodany!'); setNowyKursant({ imie: '', nazwisko: '', email: '', grupa_id: '' }); const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url'); setKursanci((data || []) as unknown as KursantAdmin[]); }
  }

  async function dodajGrupe(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('grupy').insert([{ nazwa: nowaGrupa.nazwa, miasto: nowaGrupa.miasto, edycja: nowaGrupa.edycja, drive_link: nowaGrupa.drive_link || null, numer_uslugi: nowaGrupa.numer_uslugi || null, tryb: nowaGrupa.tryb }]);
    if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Grupa dodana!'); setNowaGrupa({ nazwa: '', miasto: '', edycja: '', drive_link: '', numer_uslugi: '', tryb: 'stacjonarny' }); pobierzGrupy(); }
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

    // Czytamy plik jako ArrayBuffer żeby wykryć kodowanie
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Sprawdź BOM UTF-8 (EF BB BF) lub spróbuj UTF-8, fallback na Windows-1250
    let text: string;
    const hasBOM = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
    try {
      const decoder = new TextDecoder(hasBOM ? 'utf-8' : 'utf-8', { fatal: true });
      text = decoder.decode(buffer);
      // Jeśli UTF-8 zadziałało ale nie ma polskich znaków a są dziwne — spróbuj Windows-1250
      if (!hasBOM && /[\x80-\x9F]/.test(text)) throw new Error('likely wrong encoding');
    } catch {
      // Fallback: Windows-1250 (Excel Polska)
      const decoder = new TextDecoder('windows-1250');
      text = decoder.decode(buffer);
    }

    setImportowanie(true); setImportStatus([]);
    // Obsługa separatorów: przecinek lub średnik (Excel PL używa średnika)
    const firstLine = text.trim().split('\n')[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    const rows = text.trim().split('\n').slice(1);
    const wyniki: { imie: string; nazwisko: string; email: string; status: string }[] = [];
    for (const row of rows) {
      if (!row.trim()) continue;
      const [imie, nazwisko, email, grupa_id] = row.split(separator).map(s => s.trim().replace(/^"|"$/g, ''));
      if (!imie || !nazwisko || !email || !grupa_id) continue;
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: Math.random().toString(36).slice(-10) });
      if (authError) { wyniki.push({ imie, nazwisko, email, status: 'Blad: ' + authError.message }); continue; }
      const { error } = await supabase.from('kursanci').insert([{ imie, nazwisko, grupa_id: parseInt(grupa_id), user_id: authData.user!.id, rola: 'kursant' }]);
      wyniki.push({ imie, nazwisko, email, status: error ? 'Blad: ' + error.message : 'Dodano!' });
      await new Promise(r => setTimeout(r, 1000));
    }
    setImportStatus([...wyniki]);
    setImportowanie(false);
    const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url'); setKursanci((data || []) as unknown as KursantAdmin[]);
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
    <div className="biuro-shell">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="biuro-sidebar">
        <div className="biuro-sidebar-logo">
          <OnArchLogo height={24} color="var(--brand-dark)" />
          <span className="biuro-sidebar-role">Biuro</span>
        </div>
        <nav className="biuro-sidebar-nav">
          {[
            { id: 'home',      icon: <Home size={18}/>,        label: 'Pulpit' },
            { id: 'ogloszenia',icon: <Bell size={18}/>,        label: 'Ogłoszenia' },
            { id: 'zjazdy',    icon: <Calendar size={18}/>,    label: 'Zjazdy' },
            { id: 'zadania',   icon: <BookOpen size={18}/>,    label: 'Zadania' },
            { id: 'obecnosci', icon: <CheckSquare size={18}/>, label: 'Obecności' },
            { id: 'kursanci',  icon: <User size={18}/>,        label: 'Kursanci' },
            { id: 'grupy',     icon: <Home size={18}/>,        label: 'Grupy' },
            { id: 'prowadzacy',icon: <User size={18}/>,        label: 'Prowadzący' },
            { id: 'ankiety',   icon: <Star size={18}/>,        label: 'Ankiety' },
          ].map(item => (
            <button key={item.id}
              className={`biuro-sidebar-item ${aktywnaZakladka === item.id ? 'active' : ''}`}
              onClick={() => { setKomunikat(''); setEdytowane(null); setEdytowanyZjazd(null); setAktywnaZakladka(item.id); }}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onWyloguj} className="biuro-sidebar-wyloguj">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Wyloguj
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="biuro-content">
        {/* Mobile header */}
        <header className="biuro-mobile-header">
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}><OnArchLogo height={20} color="var(--brand-dark)" /><span style={{fontSize:'10px',opacity:0.6}}>Biuro</span></div>
          {aktywnaZakladka !== 'home' ? (
            <button onClick={() => { setKomunikat(''); setEdytowane(null); setEdytowanyZjazd(null); setAktywnaZakladka('home'); }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '13px', cursor: 'pointer' }}>
              ← Wróć
            </button>
          ) : (
            <button onClick={onWyloguj} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '13px', cursor: 'pointer' }}>Wyloguj</button>
          )}
        </header>

        {/* Desktop page header */}
        <div className="biuro-page-header">
          <div className="biuro-page-title">
            {aktywnaZakladka === 'home' && 'Pulpit'}
            {aktywnaZakladka === 'ogloszenia' && 'Ogłoszenia'}
            {aktywnaZakladka === 'zjazdy' && 'Zjazdy'}
            {aktywnaZakladka === 'zadania' && 'Zadania'}
            {aktywnaZakladka === 'obecnosci' && 'Obecności'}
            {aktywnaZakladka === 'kursanci' && 'Kursanci'}
            {aktywnaZakladka === 'grupy' && 'Grupy'}
            {aktywnaZakladka === 'prowadzacy' && 'Prowadzący'}
            {aktywnaZakladka === 'ankiety' && 'Ankiety'}
          </div>
        </div>

        <main className="biuro-main">
          {komunikat && <div className="login-error" style={{ background: '#e8f5e9', color: '#2e7d32', marginBottom: '12px' }}>{komunikat}</div>}

          {/* ─── EKRAN GŁÓWNY — KAFELKI ─── */}
          {aktywnaZakladka === 'home' && (
            <>
              <div className="biuro-welcome">
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 400, color: 'var(--brand-dark)' }}>Witaj w panelu biura</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>On-Arch Akademia</div>
              </div>
              <div className="biuro-kafelki">
                {[
                  { id: 'ogloszenia', label: 'Ogłoszenia', opis: `${ogloszenia.length} ogłoszeń`,       icon: <Bell size={22}/> },
                  { id: 'zjazdy',     label: 'Zjazdy',     opis: `${zjazdy.length} zjazdów`,            icon: <Calendar size={22}/> },
                  { id: 'zadania',    label: 'Zadania',     opis: `${zadania.length} zadań`,             icon: <BookOpen size={22}/> },
                  { id: 'obecnosci',  label: 'Obecności',  opis: 'Lista i eksport',                     icon: <CheckSquare size={22}/> },
                  { id: 'kursanci',   label: 'Kursanci',   opis: `${kursanci.length} osób`,             icon: <User size={22}/> },
                  { id: 'grupy',      label: 'Grupy',      opis: `${grupy.length} grup`,                icon: <Home size={22}/> },
                  { id: 'prowadzacy', label: 'Prowadzący', opis: `${prowadzacy.length} osób`,           icon: <User size={22}/> },
                  { id: 'ankiety',    label: 'Ankiety',    opis: `${ankiety.length} wypełnień`,         icon: <Star size={22}/> },
                ].map(k => (
                  <div key={k.id} onClick={() => setAktywnaZakladka(k.id)} className="biuro-kafelek">
                    <div className="biuro-kafelek-icon">{k.icon}</div>
                    <div>
                      <div className="biuro-kafelek-label">{k.label}</div>
                      <div className="biuro-kafelek-opis">{k.opis}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        {aktywnaZakladka === 'ogloszenia' && (
          <>
            {edytowane ? (
              <>
                <h2 className="page-title">Edytuj ogłoszenie</h2>
                <form className="admin-form" onSubmit={zapiszEdycje}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="login-field" style={{ flex: 1 }}><label>Typ</label><select value={edytowane.typ} onChange={e => setEdytowane({ ...edytowane, typ: e.target.value })}><option>Informacja</option><option>Pilne</option><option>Zmiana</option></select></div>
                    <div className="login-field" style={{ flex: 2 }}><label>Dla kogo</label><select value={edytowane.grupa_id ?? ''} onChange={e => setEdytowane({ ...edytowane, grupa_id: e.target.value ? parseInt(e.target.value) : null })}><option value="">Wszystkie grupy</option>{grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}</select></div>
                  </div>
                  <div className="login-field"><label>Tytuł</label><input type="text" value={edytowane.tytul} onChange={e => setEdytowane({ ...edytowane, tytul: e.target.value })} required /></div>
                  <div className="login-field"><label>Krótki opis</label><input type="text" value={edytowane.tresc} onChange={e => setEdytowane({ ...edytowane, tresc: e.target.value })} required /></div>
                  <div className="login-field"><label>Pełna treść</label><textarea value={edytowane.szczegoly} onChange={e => setEdytowane({ ...edytowane, szczegoly: e.target.value })} rows={4} /></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="login-btn" type="submit" style={{ flex: 1 }}>Zapisz zmiany</button>
                    <button className="btn-link" onClick={() => setEdytowane(null)}>Anuluj</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Formularz + lista obok siebie na desktopie */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* Formularz nowego ogłoszenia */}
                  <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', minWidth: '280px', flex: '1' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Nowe ogłoszenie</div>
                    <form onSubmit={dodajOgloszenie}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select value={noweOgl.typ} onChange={e => setNoweOgl({ ...noweOgl, typ: e.target.value })}
                          style={{ flex: 1, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                          <option>Informacja</option><option>Pilne</option><option>Zmiana</option>
                        </select>
                        <select value={noweOgl.grupa_id} onChange={e => setNoweOgl({ ...noweOgl, grupa_id: e.target.value })}
                          style={{ flex: 2, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                          <option value="">Wszystkie grupy</option>
                          {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                        </select>
                      </div>
                      <input type="text" value={noweOgl.tytul} onChange={e => setNoweOgl({ ...noweOgl, tytul: e.target.value })} placeholder="Tytuł *" required
                        style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                      <input type="text" value={noweOgl.tresc} onChange={e => setNoweOgl({ ...noweOgl, tresc: e.target.value })} placeholder="Krótki opis *" required
                        style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                      <textarea value={noweOgl.szczegoly} onChange={e => setNoweOgl({ ...noweOgl, szczegoly: e.target.value })} placeholder="Pełna treść (opcjonalnie)" rows={3}
                        style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '8px' }} />
                      <button type="submit" style={{ width: '100%', padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                        + Dodaj ogłoszenie
                      </button>
                    </form>
                  </div>

                  {/* Lista ogłoszeń */}
                  <div style={{ flex: '2', minWidth: '300px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
                      Lista ogłoszeń ({ogloszenia.length})
                    </div>
                    <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                      {ogloszenia.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>Brak ogłoszeń</div>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                              {['Tytuł', 'Typ', 'Dla', 'Data', ''].map((h, i) => (
                                <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {ogloszenia.map((o, idx) => (
                              <tr key={o.id} style={{ borderBottom: idx < ogloszenia.length - 1 ? '0.5px solid var(--border-soft)' : 'none', background: idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                                <td style={{ padding: '9px 12px', maxWidth: '200px' }}>
                                  <div style={{ fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.tytul}</div>
                                  {o.nowe && <span style={{ fontSize: '9px', background: 'var(--brand)', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>NOWE</span>}
                                </td>
                                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '8px',
                                    background: o.typ === 'Pilne' ? '#ffeaea' : o.typ === 'Zmiana' ? '#fef9ec' : 'var(--brand-light)',
                                    color: o.typ === 'Pilne' ? '#c62828' : o.typ === 'Zmiana' ? '#c8a84b' : 'var(--brand-dark)' }}>
                                    {o.typ}
                                  </span>
                                </td>
                                <td style={{ padding: '9px 12px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  {o.grupa_id ? grupy.find(g => g.id === o.grupa_id)?.nazwa || '—' : 'Wszystkie'}
                                </td>
                                <td style={{ padding: '9px 12px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  {new Date(o.data_utworzenia).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                                </td>
                                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                                  <button onClick={() => { setEdytowane(o); setKomunikat(''); }}
                                    style={{ fontSize: '11px', padding: '3px 10px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif', marginRight: '4px' }}>
                                    Edytuj
                                  </button>
                                  <button onClick={() => usunOgloszenie(o.id)}
                                    style={{ fontSize: '11px', padding: '3px 6px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#e57373' }}>×</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
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
                  <div className="login-field"><label>Dzień 1 (Sobota) — data</label><input type="date" value={edytowanyZjazd.data_dzien1 || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, data_dzien1: e.target.value || null })} /></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="login-field" style={{ flex: 1 }}><label>Godz. start D1</label><input type="time" value={(edytowanyZjazd as any).godzina_start_d1 || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, ...(edytowanyZjazd as any), godzina_start_d1: e.target.value || null })} /></div>
                    <div className="login-field" style={{ flex: 1 }}><label>Godz. koniec D1</label><input type="time" value={(edytowanyZjazd as any).godzina_end_d1 || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, ...(edytowanyZjazd as any), godzina_end_d1: e.target.value || null })} /></div>
                  </div>
                  <div className="login-field"><label>Dzień 2 (Niedziela) — data</label><input type="date" value={edytowanyZjazd.data_dzien2 || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, data_dzien2: e.target.value || null })} /></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="login-field" style={{ flex: 1 }}><label>Godz. start D2</label><input type="time" value={(edytowanyZjazd as any).godzina_start_d2 || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, ...(edytowanyZjazd as any), godzina_start_d2: e.target.value || null })} /></div>
                    <div className="login-field" style={{ flex: 1 }}><label>Godz. koniec D2</label><input type="time" value={(edytowanyZjazd as any).godzina_end_d2 || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, ...(edytowanyZjazd as any), godzina_end_d2: e.target.value || null })} /></div>
                  </div>
                  <div className="login-field"><label>Typ zajęć</label><select value={(edytowanyZjazd as any).typ || 'stacjonarny'} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, ...(edytowanyZjazd as any), typ: e.target.value })}><option value="stacjonarny">Stacjonarny</option><option value="online">Online</option></select></div>
                  {(edytowanyZjazd as any).typ === 'online' ? (
                    <div className="login-field"><label>Link do zajęć (Google Meet / Zoom)</label><input type="url" value={(edytowanyZjazd as any).link_online || ''} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, ...(edytowanyZjazd as any), link_online: e.target.value || null })} placeholder="https://meet.google.com/..." /></div>
                  ) : (
                    <>
                      <div className="login-field"><label>Sala</label><input type="text" value={edytowanyZjazd.sala} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, sala: e.target.value })} /></div>
                      <div className="login-field"><label>Adres</label><input type="text" value={edytowanyZjazd.adres} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, adres: e.target.value })} /></div>
                    </>
                  )}
                  <div className="login-field"><label>Tematy</label><input type="text" value={edytowanyZjazd.tematy} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, tematy: e.target.value })} required /></div>
                  <div className="login-field"><label>Status</label><select value={edytowanyZjazd.status} onChange={e => setEdytowanyZjazd({ ...edytowanyZjazd, status: e.target.value })}><option value="nadchodzacy">Nadchodzacy</option><option value="zakonczony">Zakonczony</option></select></div>

                  {/* Prowadzący */}
                  <div className="login-field">
                    <label>Prowadzący</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {(edytowanyZjazd.prowadzacy || []).map(p => (
                        <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--brand-light)', color: 'var(--brand-dark)', fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>
                          {p.imie} {p.nazwisko}
                          <button type="button" onClick={async () => {
                            await supabase.from('zjazdy_prowadzacy').delete().eq('zjazd_id', edytowanyZjazd.id).eq('prowadzacy_id', p.id);
                            setEdytowanyZjazd({ ...edytowanyZjazd, prowadzacy: (edytowanyZjazd.prowadzacy || []).filter(x => x.id !== p.id) });
                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '14px', padding: '0 0 0 2px', lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                    {prowadzacy.filter(p => !(edytowanyZjazd.prowadzacy || []).some(ep => ep.id === p.id)).length > 0 && (
                      <select defaultValue="" onChange={async e => {
                        const pid = parseInt(e.target.value);
                        if (!pid) return;
                        await supabase.from('zjazdy_prowadzacy').insert([{ zjazd_id: edytowanyZjazd.id, prowadzacy_id: pid }]);
                        const nowy = prowadzacy.find(p => p.id === pid);
                        if (nowy) setEdytowanyZjazd({ ...edytowanyZjazd, prowadzacy: [...(edytowanyZjazd.prowadzacy || []), nowy] });
                        e.target.value = '';
                      }} style={{ fontSize: '13px', padding: '7px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', background: 'white', width: '100%' }}>
                        <option value="">+ Dodaj prowadzącego…</option>
                        {prowadzacy.filter(p => !(edytowanyZjazd.prowadzacy || []).some(ep => ep.id === p.id)).map(p => (
                          <option key={p.id} value={p.id}>{p.imie} {p.nazwisko}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button className="login-btn" type="submit">Zapisz zmiany</button>
                  <button className="btn-link" onClick={() => setEdytowanyZjazd(null)}>Anuluj</button>
                </form>
              </>
            ) : (
              <>
                {/* ── PRZEŁĄCZNIK WIDOKU ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', background: 'white', border: '0.5px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    {(['tabela', 'kalendarz'] as const).map(w => (
                      <button key={w} onClick={() => setWidokZjazdow(w)}
                        style={{ padding: '7px 18px', border: 'none', background: widokZjazdow === w ? 'var(--brand)' : 'white', color: widokZjazdow === w ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}>
                        {w === 'tabela' ? '☰ Tabela' : '📅 Kalendarz'}
                      </button>
                    ))}
                  </div>
                  {/* Filtry dla kalendarza */}
                  {widokZjazdow === 'kalendarz' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input type="month" value={kalMiesiac} onChange={e => setKalMiesiac(e.target.value)}
                        style={{ fontSize: '12px', padding: '6px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }} />
                      <select value={kalFiltrGrupa} onChange={e => setKalFiltrGrupa(e.target.value)}
                        style={{ fontSize: '12px', padding: '6px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                        <option value="">Wszystkie grupy</option>
                        {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                      </select>
                      <select value={kalFiltrProwadzacy} onChange={e => setKalFiltrProwadzacy(e.target.value)}
                        style={{ fontSize: '12px', padding: '6px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                        <option value="">Wszyscy prowadzący</option>
                        {prowadzacy.map(p => <option key={p.id} value={p.id}>{p.imie} {p.nazwisko}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* ── WIDOK KALENDARZA ── */}
                {widokZjazdow === 'kalendarz' && (() => {
                  const [rok, miesiac] = kalMiesiac.split('-').map(Number);
                  const pierwszyDzien = new Date(rok, miesiac - 1, 1);
                  const ostatniDzien = new Date(rok, miesiac, 0);
                  const startDow = (pierwszyDzien.getDay() + 6) % 7; // Pon=0
                  const liczbaDni = ostatniDzien.getDate();

                  // Filtruj zjazdy — tylko nadchodzące + tylko z filtrami
                  const zjazdyFiltr = zjazdy.filter(z => {
                    if (z.status === 'zakonczony') return false;
                    if (kalFiltrGrupa && z.grupa_id !== parseInt(kalFiltrGrupa)) return false;
                    if (kalFiltrProwadzacy && !(z.prowadzacy || []).some(p => p.id === parseInt(kalFiltrProwadzacy))) return false;
                    return true;
                  });

                  // Mapa: data (YYYY-MM-DD) -> zjazdy w tym dniu
                  const mapaZjazdow: Record<string, { zjazd: Zjazd; dzien: 1|2 }[]> = {};
                  zjazdyFiltr.forEach(z => {
                    [z.data_dzien1, z.data_dzien2].forEach((data, idx) => {
                      if (!data) return;
                      const d = data.substring(0, 10);
                      if (!mapaZjazdow[d]) mapaZjazdow[d] = [];
                      mapaZjazdow[d].push({ zjazd: z, dzien: (idx + 1) as 1|2 });
                    });
                  });

                  const komorki: (number | null)[] = [
                    ...Array(startDow).fill(null),
                    ...Array.from({ length: liczbaDni }, (_, i) => i + 1)
                  ];
                  // Uzupełnij do pełnych tygodni
                  while (komorki.length % 7 !== 0) komorki.push(null);

                  const dzisiaj = new Date().toISOString().split('T')[0];
                  const nazwyDni = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
                  const nazwyMiesiecy = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];

                  // Kolory per grupa (cykl)
                  const kolorGrupy = ['#B35758','#1565c0','#2e7d32','#c8a84b','#6a1b9a','#d84315','#00838f','#4e342e'];
                  const grupaKolor: Record<number, string> = {};
                  grupy.forEach((g, i) => { grupaKolor[g.id] = kolorGrupy[i % kolorGrupy.length]; });

                  return (
                    <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', overflow: 'hidden', marginBottom: '24px' }}>
                      {/* Nagłówek miesiąca */}
                      <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button onClick={() => { const d = new Date(rok, miesiac - 2, 1); setKalMiesiac(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }}
                          style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>‹</button>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 400, color: 'var(--brand-dark)' }}>
                          {nazwyMiesiecy[miesiac - 1]} {rok}
                        </span>
                        <button onClick={() => { const d = new Date(rok, miesiac, 1); setKalMiesiac(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }}
                          style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>›</button>
                      </div>
                      {/* Dni tygodnia */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '0.5px solid var(--border)' }}>
                        {nazwyDni.map(d => (
                          <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg)' }}>{d}</div>
                        ))}
                      </div>
                      {/* Siatka dni */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {komorki.map((dzien, idx) => {
                          const dataStr = dzien ? `${rok}-${String(miesiac).padStart(2,'0')}-${String(dzien).padStart(2,'0')}` : '';
                          const wpisy = dataStr ? (mapaZjazdow[dataStr] || []) : [];
                          const czyDzisiaj = dataStr === dzisiaj;
                          const czyWeekend = idx % 7 >= 5;
                          return (
                            <div key={idx} style={{
                              minHeight: '80px', padding: '6px', borderBottom: '0.5px solid var(--border-soft)',
                              borderRight: idx % 7 < 6 ? '0.5px solid var(--border-soft)' : 'none',
                              background: !dzien ? '#faf9f8' : czyWeekend ? '#fdf8f7' : 'white',
                            }}>
                              {dzien && (
                                <>
                                  <div style={{
                                    width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: czyDzisiaj ? 'var(--brand)' : 'transparent',
                                    color: czyDzisiaj ? 'white' : czyWeekend ? 'var(--brand)' : 'var(--text)',
                                    fontSize: '11px', fontWeight: czyDzisiaj ? 700 : 400, marginBottom: '4px',
                                  }}>{dzien}</div>
                                  {wpisy.map((w, i) => {
                                    const grupa = grupy.find(g => g.id === w.zjazd.grupa_id);
                                    const kolor = grupaKolor[w.zjazd.grupa_id] || '#B35758';
                                    return (
                                      <div key={i} title={`Zjazd ${w.zjazd.nr} — ${grupa?.nazwa || ''}\nDzień ${w.dzien}: ${w.dzien === 1 ? w.zjazd.godzina_start_d1 || '' : w.zjazd.godzina_start_d2 || ''}–${w.dzien === 1 ? w.zjazd.godzina_end_d1 || '' : w.zjazd.godzina_end_d2 || ''}\n${w.zjazd.tematy || ''}\n${(w.zjazd.prowadzacy||[]).map(p=>`${p.imie} ${p.nazwisko}`).join(', ')}`}
                                        style={{
                                          background: kolor + '18', borderLeft: `3px solid ${kolor}`,
                                          borderRadius: '0 4px 4px 0', padding: '2px 5px', marginBottom: '2px',
                                          fontSize: '10px', color: kolor, fontWeight: 600, lineHeight: 1.4,
                                          cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                        {grupa?.nazwa || ''}
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Legenda */}
                      {grupy.filter(g => !kalFiltrGrupa || g.id === parseInt(kalFiltrGrupa)).length > 0 && (
                        <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {grupy.filter(g => !kalFiltrGrupa || g.id === parseInt(kalFiltrGrupa)).map(g => (
                            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: grupaKolor[g.id] || '#B35758' }}></div>
                              {g.nazwa}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── TABELA DODAWANIA ZJAZDÓW ── */}
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h2 className="page-title" style={{ margin: 0 }}>Dodaj zjazdy</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={tabelaGrupa} onChange={e => {
                      const gId = e.target.value;
                      setTabelaGrupa(gId);
                      if (gId) {
                        const g = grupy.find(g => g.id === parseInt(gId));
                        const typ = g?.tryb === 'online' ? 'online' : 'stacjonarny';
                        setTabelaZjazdow(t => t.map(w => ({ ...w, typ })));
                      }
                    }}
                      style={{ fontSize: '13px', padding: '7px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                      <option value="">Wybierz grupę…</option>
                      {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                    <button onClick={() => {
                      const g = grupy.find(g => g.id === parseInt(tabelaGrupa));
                      const typ = g?.tryb === 'online' ? 'online' : 'stacjonarny';
                      setTabelaZjazdow(t => [...t, pustyWiersz(typ)]);
                    }}
                      style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontFamily: 'Jost, sans-serif', color: 'var(--text-muted)' }}>
                      + Dodaj wiersz
                    </button>
                    <button onClick={() => setPokazInstrukcjePaste(v => !v)}
                      style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid var(--brand-mid)', borderRadius: '10px', background: 'var(--brand-light)', cursor: 'pointer', fontFamily: 'Jost, sans-serif', color: 'var(--brand-dark)' }}>
                      📋 Wklej z Excela
                    </button>
                    <button onClick={zapiszTabelaZjazdow} disabled={tabelaZapis || !tabelaGrupa}
                      style={{ fontSize: '13px', padding: '7px 20px', border: 'none', borderRadius: '10px', background: tabelaGrupa ? 'var(--brand)' : '#ccc', color: 'white', cursor: tabelaGrupa ? 'pointer' : 'not-allowed', fontFamily: 'Jost, sans-serif', fontWeight: 600 }}>
                      {tabelaZapis ? 'Zapisywanie…' : '💾 Zapisz wszystkie'}
                    </button>
                  </div>
                </div>

                {/* Panel wklejania z Excela */}
                {pokazInstrukcjePaste && (
                  <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>📋 Wklej z Excela / Arkuszy Google</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                      Skopiuj kolumny z arkusza w kolejności:<br/>
                      <strong>Nr · Data D1 · Data D2 · Godz. start · Godz. koniec · Typ · Sala lub Link · Adres · Temat</strong><br/>
                      Format dat: DD.MM.YYYY lub YYYY-MM-DD. Nagłówek zostanie automatycznie pominięty.
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Wklej skopiowane komórki z Excela tutaj (Ctrl+V)…"
                      onPaste={e => {
                        const tekst = e.clipboardData.getData('text');
                        if (tekst) { wklejZExcela(tekst); setPokazInstrukcjePaste(false); e.preventDefault(); }
                      }}
                      style={{ width: '100%', fontSize: '12px', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'monospace', resize: 'vertical', color: 'var(--text)' }}
                    />
                    <button onClick={() => setPokazInstrukcjePaste(false)}
                      style={{ marginTop: '8px', fontSize: '12px', padding: '6px 14px', border: '0.5px solid var(--border)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontFamily: 'Jost, sans-serif', color: 'var(--text-muted)' }}>
                      Anuluj
                    </button>
                  </div>
                )}

                {/* Wyniki zapisu */}
                {tabelaWyniki.length > 0 && (
                  <div style={{ background: '#e8f5e9', border: '0.5px solid #c8e6c9', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                    {tabelaWyniki.map((w, i) => (
                      <div key={i} style={{ fontSize: '12px', color: w.status.startsWith('✓') ? '#2e7d32' : '#c62828' }}>
                        Zjazd {w.nr}: {w.status}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabela */}
                <div style={{ overflowX: 'auto', marginBottom: '24px', borderRadius: '14px', border: '0.5px solid var(--border)', background: 'white' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                        {['Nr', 'Data D1', 'Data D2', 'Godz. start', 'Godz. koniec', 'Typ', 'Sala / Link', 'Adres', 'Temat', 'Prowadzący', ''].map(h => (
                          <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tabelaZjazdow.map((w, idx) => {
                        const update = (field: keyof WierszZjazdu, val: string) =>
                          setTabelaZjazdow(t => t.map((r, i) => i === idx ? { ...r, [field]: val } : r));
                        const kopiujWiersz = () =>
                          setTabelaZjazdow(t => [...t.slice(0, idx + 1), { ...w, _id: Math.random().toString(36).slice(2), nr: String(parseInt(w.nr || '0') + 1) }, ...t.slice(idx + 1)]);
                        const usunWiersz = () =>
                          setTabelaZjazdow(t => t.filter((_, i) => i !== idx));
                        const inputStyle = { width: '100%', border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'Jost, sans-serif', background: 'transparent', padding: '2px 0' };
                        const tdStyle = { padding: '6px 10px', borderBottom: '0.5px solid var(--border-soft)', verticalAlign: 'middle' as const };
                        return (
                          <tr key={w._id} style={{ background: idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                            <td style={{ ...tdStyle, width: '48px' }}>
                              <input style={{ ...inputStyle, width: '40px', textAlign: 'center', fontWeight: 600 }} type="number" min="1" value={w.nr} onChange={e => update('nr', e.target.value)} placeholder="1" />
                            </td>
                            <td style={{ ...tdStyle, width: '130px' }}>
                              <input style={inputStyle} type="date" value={w.data_dzien1} onChange={e => update('data_dzien1', e.target.value)} />
                            </td>
                            <td style={{ ...tdStyle, width: '130px' }}>
                              <input style={inputStyle} type="date" value={w.data_dzien2} onChange={e => update('data_dzien2', e.target.value)} />
                            </td>
                            <td style={{ ...tdStyle, width: '90px' }}>
                              <input style={inputStyle} type="time" value={w.godzina_start_d1} onChange={e => update('godzina_start_d1', e.target.value)} />
                            </td>
                            <td style={{ ...tdStyle, width: '90px' }}>
                              <input style={inputStyle} type="time" value={w.godzina_end_d1} onChange={e => update('godzina_end_d1', e.target.value)} />
                            </td>
                            <td style={{ ...tdStyle, width: '110px' }}>
                              <select value={w.typ} onChange={e => update('typ', e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="stacjonarny">Stacjonarny</option>
                                <option value="online">Online</option>
                              </select>
                            </td>
                            <td style={{ ...tdStyle, minWidth: '140px' }}>
                              {w.typ === 'online'
                                ? <input style={inputStyle} type="url" value={w.link_online} onChange={e => update('link_online', e.target.value)} placeholder="https://meet.google.com/…" />
                                : <input style={inputStyle} type="text" value={w.sala} onChange={e => update('sala', e.target.value)} placeholder="Sala A" />
                              }
                            </td>
                            <td style={{ ...tdStyle, minWidth: '140px' }}>
                              <input style={inputStyle} type="text" value={w.adres} onChange={e => update('adres', e.target.value)} placeholder="ul. Przykładowa 1, Warszawa" />
                            </td>
                            <td style={{ ...tdStyle, minWidth: '160px' }}>
                              <input style={inputStyle} type="text" value={w.tematy} onChange={e => update('tematy', e.target.value)} placeholder="Temat zajęć…" />
                            </td>
                            <td style={{ ...tdStyle, width: '140px' }}>
                              <select value={w.prowadzacy_id} onChange={e => update('prowadzacy_id', e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="">— brak —</option>
                                {prowadzacy.map(p => <option key={p.id} value={p.id}>{p.imie} {p.nazwisko}</option>)}
                              </select>
                            </td>
                            <td style={{ ...tdStyle, width: '60px', whiteSpace: 'nowrap' }}>
                              <button onClick={kopiujWiersz} title="Kopiuj wiersz"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '2px 4px' }}>⎘</button>
                              <button onClick={usunWiersz} title="Usuń wiersz"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e57373', fontSize: '14px', padding: '2px 4px' }}>×</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <h2 className="page-title" style={{ marginTop: '8px' }}>Lista zjazdów</h2>

                {/* Filtr po grupie */}
                {grupy.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div className="login-field" style={{ marginBottom: 0, flex: 1 }}>
                      <select
                        value={(nowyZjazd as any)._filterGrupa || ''}
                        onChange={e => setNowyZjazd({ ...nowyZjazd, ...(nowyZjazd as any), _filterGrupa: e.target.value })}
                        style={{ fontSize: '12px', padding: '6px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white', width: '100%' }}>
                        <option value="">Wszystkie grupy</option>
                        {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setZwinieteZjazdy(new Set(grupy.map(g => g.id)))}
                      style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                      Zwiń wszystkie
                    </button>
                    <button onClick={() => setZwinieteZjazdy(new Set())}
                      style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                      Rozwiń wszystkie
                    </button>
                  </div>
                )}

                {/* Zgrupowane per grupa */}
                {grupy
                  .filter(g => !((nowyZjazd as any)._filterGrupa) || g.id === parseInt((nowyZjazd as any)._filterGrupa))
                  .map(g => {
                    const zjazdyGrupy = zjazdy.filter(z => z.grupa_id === g.id);
                    if (zjazdyGrupy.length === 0) return null;
                    const zwinieta = zwinieteZjazdy.has(g.id);
                    return (
                      <div key={g.id} style={{ marginBottom: '12px' }}>
                        {/* Nagłówek grupy — klikalny */}
                        <div onClick={() => setZwinieteZjazdy(prev => { const next = new Set(prev); next.has(g.id) ? next.delete(g.id) : next.add(g.id); return next; })}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'white', borderRadius: zwinieta ? '12px' : '12px 12px 0 0', border: '0.5px solid var(--border)', cursor: 'pointer', userSelect: 'none' as const }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-block', transform: zwinieta ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 400, color: 'var(--brand-dark)', flex: 1 }}>{g.nazwa}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '10px', border: '0.5px solid var(--border)' }}>
                            {zjazdyGrupy.length} zjazdów
                          </span>
                        </div>
                        {/* Tabela + podsumowanie — zwijane */}
                        {!zwinieta && (<>
                        <div style={{ background: 'white', borderRadius: '0', border: '0.5px solid var(--border)', borderTop: 'none', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                                {['#', 'Daty', 'Temat', 'Prowadzący', 'Status', ''].map((h, i) => (
                                  <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {zjazdyGrupy.map((z, idx) => (
                                <tr key={z.id} style={{ borderBottom: idx < zjazdyGrupy.length - 1 ? '0.5px solid var(--border-soft)' : 'none', background: idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                                  <td style={{ padding: '9px 12px', fontWeight: 700, color: 'var(--brand-dark)', width: '32px' }}>{z.nr}</td>
                                  <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                                    {z.daty}
                                    {z.typ === 'online' && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#e8f0fe', color: '#1565c0', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>online</span>}
                                  </td>
                                  <td style={{ padding: '9px 12px', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.tematy || '—'}</td>
                                  <td style={{ padding: '9px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {(z.prowadzacy || []).map(p => `${p.imie} ${p.nazwisko}`).join(', ') || '—'}
                                  </td>
                                  <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: z.status === 'nadchodzacy' ? '#e8f5e9' : '#f5f5f5', color: z.status === 'nadchodzacy' ? '#2e7d32' : '#999' }}>
                                      {z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                                    <button onClick={() => { setEdytowanyZjazd(z); setKomunikat(''); }}
                                      style={{ fontSize: '11px', padding: '3px 10px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif', marginRight: '4px' }}>
                                      Edytuj
                                    </button>
                                    <button onClick={() => usunZjazd(z.id)}
                                      style={{ fontSize: '11px', padding: '3px 6px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#e57373' }}>
                                      ×
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Podsumowanie godzin */}
                        {(() => {
                          const liczGodziny = (start: string | null, end: string | null) => {
                            if (!start || !end) return 0;
                            const [sh, sm] = start.split(':').map(Number);
                            const [eh, em] = end.split(':').map(Number);
                            return Math.max(0, Math.round(((eh * 60 + em) - (sh * 60 + sm))));
                          };
                          let sumaD1 = 0, sumaD2 = 0;
                          zjazdyGrupy.forEach(z => {
                            sumaD1 += liczGodziny((z as any).godzina_start_d1, (z as any).godzina_end_d1);
                            sumaD2 += liczGodziny((z as any).godzina_start_d2, (z as any).godzina_end_d2);
                          });
                          const suma = sumaD1 + sumaD2;
                          if (suma === 0) return null;
                          const fmt = (min: number) => {
                            const h = Math.floor(min / 60);
                            const m = min % 60;
                            return m > 0 ? `${h}h ${m}min` : `${h}h`;
                          };
                          return (
                            <div style={{ display: 'flex', gap: '16px', padding: '8px 14px', background: 'var(--brand-light)', borderRadius: '0 0 12px 12px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: 'var(--brand-dark)', fontWeight: 600 }}>Łącznie: {fmt(suma)}</span>
                              {sumaD1 > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dzień 1: {fmt(sumaD1)}</span>}
                              {sumaD2 > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dzień 2: {fmt(sumaD2)}</span>}
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({zjazdyGrupy.length} zjazdów)</span>
                            </div>
                          );
                        })()}
                        </>)}
                      </div>
                    );
                  })}

              </>
            )}
          </>
        )}

        {aktywnaZakladka === 'kursanci' && (
          <>
            {/* TOOLBAR — dodaj ręcznie + CSV */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Formularz dodawania */}
              <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', flex: '1', minWidth: '280px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Dodaj kursanta</div>
                <form onSubmit={dodajKursanta}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" value={nowyKursant.imie} onChange={e => setNowyKursant({ ...nowyKursant, imie: e.target.value })} placeholder="Imię" required style={{ fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }} />
                    <input type="text" value={nowyKursant.nazwisko} onChange={e => setNowyKursant({ ...nowyKursant, nazwisko: e.target.value })} placeholder="Nazwisko" required style={{ fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }} />
                  </div>
                  <input type="email" value={nowyKursant.email} onChange={e => setNowyKursant({ ...nowyKursant, email: e.target.value })} placeholder="Email" required style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={nowyKursant.grupa_id} onChange={e => setNowyKursant({ ...nowyKursant, grupa_id: e.target.value })} required style={{ flex: 1, fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                      <option value="">Wybierz grupę</option>
                      {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                    <button type="submit" style={{ padding: '7px 16px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>+ Dodaj</button>
                  </div>
                </form>
              </div>

              {/* Import CSV */}
              <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', flex: '1', minWidth: '280px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Import z CSV</div>
                <code style={{ fontSize: '11px', background: 'var(--bg)', padding: '6px 8px', borderRadius: '6px', display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}>imie,nazwisko,email,grupa_id</code>
                {importowanie ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--brand)', padding: '8px' }}>
                    <div style={{ width: '14px', height: '14px', border: '2px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Trwa import…
                  </div>
                ) : (
                  <input ref={fileRef} type="file" accept=".csv" onChange={importujCSV} style={{ fontSize: '12px', width: '100%' }} />
                )}
                {importStatus.length > 0 && (
                  <div style={{ marginTop: '8px', maxHeight: '80px', overflowY: 'auto' }}>
                    {importStatus.map((s, i) => (
                      <div key={i} style={{ fontSize: '11px', color: s.status === 'Dodano!' ? '#2e7d32' : '#c62828', padding: '2px 0' }}>
                        {s.imie} {s.nazwisko} — {s.status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LISTA KURSANTÓW — pogrupowana, zwijana, z edycją */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <h2 className="page-title" style={{ margin: 0 }}>Lista kursantów</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                {/* Wyszukiwarka */}
                <div style={{ position: 'relative', flex: '1', maxWidth: '280px', minWidth: '160px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    value={szukajKursant}
                    onChange={e => { setSzukajKursant(e.target.value); setZwinieteGrupy(new Set()); }}
                    placeholder="Szukaj po nazwisku lub emailu…"
                    style={{ width: '100%', fontSize: '12px', padding: '7px 10px 7px 28px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}
                  />
                  {szukajKursant && (
                    <button onClick={() => setSzukajKursant('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1 }}>×</button>
                  )}
                </div>
                <button onClick={() => setZwinieteGrupy(new Set(grupy.map(g => g.id)))}
                  style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                  Zwiń wszystkie
                </button>
                <button onClick={() => setZwinieteGrupy(new Set())}
                  style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                  Rozwiń wszystkie
                </button>
                <button onClick={() => {
                  const naglowki = ['imie', 'nazwisko', 'email', 'telefon', 'grupa'];
                  const wiersze = kursanci.map(k => [
                    `"${k.imie}"`, `"${k.nazwisko}"`,
                    `"${k.email || ''}"`, `"${k.telefon || ''}"`,
                    `"${grupy.find(g => g.id === k.grupa_id)?.nazwa || ''}"`,
                  ].join(','));
                  const csv = '\uFEFF' + [naglowki.join(','), ...wiersze].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'kursanci.csv'; a.click();
                }} style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                  ⬇ CSV
                </button>
              </div>
            </div>

            {grupy.map(g => {
              const szukaj = szukajKursant.toLowerCase().trim();
              const kursanciGrupy = kursanci.filter(k => {
                if (k.grupa_id !== g.id) return false;
                if (!szukaj) return true;
                return (
                  `${k.imie} ${k.nazwisko}`.toLowerCase().includes(szukaj) ||
                  (k.email || '').toLowerCase().includes(szukaj) ||
                  (k.telefon || '').includes(szukaj)
                );
              });
              if (kursanciGrupy.length === 0) return null;
              const zwinieta = zwinieteGrupy.has(g.id);
              return (
                <div key={g.id} style={{ marginBottom: '10px' }}>
                  <div onClick={() => setZwinieteGrupy(prev => {
                    const next = new Set(prev);
                    next.has(g.id) ? next.delete(g.id) : next.add(g.id);
                    return next;
                  })} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'white', borderRadius: zwinieta ? '12px' : '12px 12px 0 0', border: '0.5px solid var(--border)', cursor: 'pointer', userSelect: 'none' as const }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-block', transform: zwinieta ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 400, color: 'var(--brand-dark)', flex: 1 }}>{g.nazwa}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '10px', border: '0.5px solid var(--border)' }}>
                      {kursanciGrupy.length} {szukaj ? 'wyników' : 'osób'}
                    </span>
                  </div>
                  {!zwinieta && (
                    <div style={{ background: 'white', borderRadius: '0 0 12px 12px', border: '0.5px solid var(--border)', borderTop: 'none', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                            {['Imię i nazwisko', 'Email', 'Telefon', 'Certyfikat', ''].map((h, i) => (
                              <th key={i} style={{ padding: '7px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {kursanciGrupy.map((k, idx) => {
                            const edytuje = edytowanyKursant?.id === k.id;
                            return (
                              <tr key={k.id} style={{ borderBottom: idx < kursanciGrupy.length - 1 ? '0.5px solid var(--border-soft)' : 'none', background: edytuje ? '#fdf5f5' : idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                                <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                                  {edytuje ? (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <input value={edytowanyKursant.imie} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, imie: e.target.value })}
                                        style={{ width: '90px', fontSize: '12px', padding: '4px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                                      <input value={edytowanyKursant.nazwisko} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, nazwisko: e.target.value })}
                                        style={{ width: '110px', fontSize: '12px', padding: '4px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                                    </div>
                                  ) : (
                                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{k.imie} {k.nazwisko}</span>
                                  )}
                                </td>
                                <td style={{ padding: '7px 12px' }}>
                                  {edytuje ? (
                                    <input value={edytowanyKursant.email} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, email: e.target.value })}
                                      style={{ width: '160px', fontSize: '12px', padding: '4px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                                  ) : (
                                    <span style={{ fontSize: '11px', color: k.email ? 'var(--text-muted)' : '#ccc' }}>{k.email || '—'}</span>
                                  )}
                                </td>
                                <td style={{ padding: '7px 12px' }}>
                                  {edytuje ? (
                                    <input value={edytowanyKursant.telefon} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, telefon: e.target.value })}
                                      placeholder="+48 600 000 000"
                                      style={{ width: '130px', fontSize: '12px', padding: '4px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                                  ) : (
                                    k.telefon
                                      ? <a href={`tel:${k.telefon}`} style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>{k.telefon}</a>
                                      : <span style={{ fontSize: '11px', color: '#ccc' }}>—</span>
                                  )}
                                </td>
                                <td style={{ padding: '6px 12px', minWidth: '200px' }}>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input type="url" defaultValue={k.certyfikat_url || ''} placeholder="https://drive.google.com/..."
                                      onBlur={async e => {
                                        if (e.target.value !== (k.certyfikat_url || '')) {
                                          await supabase.from('kursanci').update({ certyfikat_url: e.target.value || null }).eq('id', k.id);
                                          setKomunikat(`Certyfikat zapisany dla ${k.imie} ${k.nazwisko}`);
                                        }
                                      }}
                                      style={{ flex: 1, fontSize: '11px', padding: '5px 8px', borderRadius: '6px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', background: k.certyfikat_url ? '#f0faf4' : 'white' }} />
                                    {k.certyfikat_url && (
                                      <a href={k.certyfikat_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#2e7d32', textDecoration: 'none' }}>🎓</a>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                                  {edytuje ? (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button onClick={async () => {
                                        await supabase.from('kursanci').update({ imie: edytowanyKursant.imie, nazwisko: edytowanyKursant.nazwisko, email: edytowanyKursant.email || null, telefon: edytowanyKursant.telefon || null }).eq('id', k.id);
                                        const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url');
                                        setKursanci((data || []) as unknown as KursantAdmin[]);
                                        setEdytowanyKursant(null); setKomunikat('Zapisano!');
                                      }} style={{ fontSize: '11px', padding: '3px 10px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>✓</button>
                                      <button onClick={() => setEdytowanyKursant(null)}
                                        style={{ fontSize: '11px', padding: '3px 8px', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button onClick={() => setEdytowanyKursant({ id: k.id, imie: k.imie, nazwisko: k.nazwisko, email: k.email || '', telefon: k.telefon || '' })}
                                        style={{ fontSize: '11px', padding: '3px 10px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>Edytuj</button>
                                      <button onClick={async () => {
                                        if (window.confirm(`Usunąć ${k.imie} ${k.nazwisko}?`)) {
                                          await supabase.from('kursanci').delete().eq('id', k.id);
                                          const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url');
                                          setKursanci((data || []) as unknown as KursantAdmin[]); setKomunikat('Usunięto.');
                                        }
                                      }} style={{ fontSize: '11px', padding: '3px 6px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#e57373' }}>×</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
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
              <div className="login-field"><label>Numer usługi BUR (opcjonalnie)</label><input type="text" value={nowaGrupa.numer_uslugi} onChange={e => setNowaGrupa({ ...nowaGrupa, numer_uslugi: e.target.value })} placeholder="np. 2025/09/24/195975/3028966" /></div>
              <div className="login-field"><label>Tryb zajęć</label><select value={nowaGrupa.tryb} onChange={e => setNowaGrupa({ ...nowaGrupa, tryb: e.target.value })}><option value="stacjonarny">Stacjonarny</option><option value="online">Online</option><option value="hybrydowy">Hybrydowy</option></select></div>
              <button className="login-btn" type="submit">Dodaj grupe</button>
            </form>
            <h2 className="page-title" style={{ marginTop: '24px' }}>Lista grup</h2>
            <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                    {['ID', 'Nazwa', 'Miasto', 'Edycja', 'Tryb', 'Strefa Wiedzy (Drive)'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grupy.map((g, idx) => (
                    <tr key={g.id} style={{ borderBottom: idx < grupy.length - 1 ? '0.5px solid var(--border-soft)' : 'none', background: idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: 'var(--brand)', width: '40px' }}>{g.id}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {g.nazwa}
                        <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg)', padding: '1px 6px', borderRadius: '6px', border: '0.5px solid var(--border)', fontWeight: 400 }}>
                          {kursanci.filter(k => k.grupa_id === g.id).length} os.
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{g.miasto}</td>
                      <td style={{ padding: '9px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{g.edycja}</td>
                      <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                        <select defaultValue={g.tryb || 'stacjonarny'}
                          onChange={async e => { await supabase.from('grupy').update({ tryb: e.target.value }).eq('id', g.id); pobierzGrupy(); }}
                          style={{ fontSize: '11px', padding: '3px 8px', border: '0.5px solid var(--border)', borderRadius: '6px', fontFamily: 'Jost, sans-serif', background: 'white',
                            color: g.tryb === 'online' ? '#1565c0' : g.tryb === 'hybrydowy' ? '#c8a84b' : 'var(--text)' }}>
                          <option value="stacjonarny">📍 Stacjonarny</option>
                          <option value="online">🌐 Online</option>
                          <option value="hybrydowy">⚡ Hybrydowy</option>
                        </select>
                      </td>
                      <td style={{ padding: '6px 12px', minWidth: '180px' }}>
                        <input type="url" defaultValue={g.drive_link || ''} placeholder="https://drive.google.com/..."
                          onBlur={e => { if (e.target.value !== (g.drive_link || '')) zapiszDriveLink(g.id, e.target.value); }}
                          style={{ width: '100%', fontSize: '11px', padding: '5px 8px', borderRadius: '6px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', background: g.drive_link ? '#f0faf4' : 'white' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Formularz */}
              <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', minWidth: '280px', flex: '1' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Nowe zadanie</div>
                <form onSubmit={dodajZadanie}>
                  <select value={noweZadanie.grupa_id} onChange={e => { setNoweZadanie({ ...noweZadanie, grupa_id: e.target.value }); setWybranaGrupaZadan(e.target.value); }} required
                    style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white', marginBottom: '8px' }}>
                    <option value="">Wybierz grupę *</option>
                    {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                  </select>
                  <input type="text" value={noweZadanie.tytul} onChange={e => setNoweZadanie({ ...noweZadanie, tytul: e.target.value })} placeholder="Tytuł zadania *" required
                    style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                  <textarea value={noweZadanie.opis} onChange={e => setNoweZadanie({ ...noweZadanie, opis: e.target.value })} placeholder="Opis / instrukcja" rows={3}
                    style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="date" value={noweZadanie.termin} onChange={e => setNoweZadanie({ ...noweZadanie, termin: e.target.value })}
                      style={{ flex: 1, fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }} />
                    <select value={noweZadanie.typ} onChange={e => setNoweZadanie({ ...noweZadanie, typ: e.target.value })}
                      style={{ flex: 1, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                      <option value="zadanie">Zadanie domowe</option>
                      <option value="praca_zaliczeniowa">Praca zaliczeniowa</option>
                    </select>
                  </div>
                  <input type="url" value={noweZadanie.link_materialow} onChange={e => setNoweZadanie({ ...noweZadanie, link_materialow: e.target.value })} placeholder="Link do materiałów (opcjonalnie)"
                    style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                  <button type="submit" style={{ width: '100%', padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                    + Dodaj zadanie
                  </button>
                </form>
              </div>

              {/* Lista zadań */}
              <div style={{ flex: '2', minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Lista zadań ({zadania.length})</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <select value={wybranaGrupaZadan} onChange={e => setWybranaGrupaZadan(e.target.value)}
                      style={{ fontSize: '11px', padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                      <option value="">Wszystkie grupy</option>
                      {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                    </select>
                    <button onClick={() => setZwinieteZadania(new Set(grupy.map(g => g.id)))}
                      style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>Zwiń</button>
                    <button onClick={() => setZwinieteZadania(new Set())}
                      style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>Rozwiń</button>
                  </div>
                </div>

                {grupy
                  .filter(g => !wybranaGrupaZadan || g.id === parseInt(wybranaGrupaZadan))
                  .map(g => {
                    const zadaniaGrupy = zadania.filter(z => z.grupa_id === g.id);
                    if (zadaniaGrupy.length === 0) return null;
                    const zwinieta = zwinieteZadania.has(g.id);
                    return (
                      <div key={g.id} style={{ marginBottom: '10px' }}>
                        {/* Nagłówek grupy */}
                        <div onClick={() => setZwinieteZadania(prev => { const next = new Set(prev); next.has(g.id) ? next.delete(g.id) : next.add(g.id); return next; })}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', background: 'white', borderRadius: zwinieta ? '12px' : '12px 12px 0 0', border: '0.5px solid var(--border)', cursor: 'pointer', userSelect: 'none' as const }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-block', transform: zwinieta ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 400, color: 'var(--brand-dark)', flex: 1 }}>{g.nazwa}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '10px', border: '0.5px solid var(--border)' }}>
                            {zadaniaGrupy.length} {zadaniaGrupy.length === 1 ? 'zadanie' : 'zadań'}
                          </span>
                        </div>
                        {!zwinieta && (
                          <div style={{ background: 'white', borderRadius: '0 0 12px 12px', border: '0.5px solid var(--border)', borderTop: 'none', overflow: 'hidden' }}>
                            {zadaniaGrupy.map((z, idx) => {
                              const odp = odpowiedziZadan.filter(o => o.zadanie_id === z.id);
                              return (
                                <div key={z.id} style={{ borderBottom: idx < zadaniaGrupy.length - 1 ? '0.5px solid var(--border-soft)' : 'none', padding: '10px 14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{z.tytul}</span>
                                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '8px',
                                          background: z.typ === 'praca_zaliczeniowa' ? '#fef9ec' : 'var(--brand-light)',
                                          color: z.typ === 'praca_zaliczeniowa' ? '#c8a84b' : 'var(--brand-dark)' }}>
                                          {z.typ === 'praca_zaliczeniowa' ? 'Zaliczenie' : 'Zadanie'}
                                        </span>
                                        {z.termin && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>📅 {new Date(z.termin).toLocaleDateString('pl-PL')}</span>}
                                        {z.link_materialow && <a href={z.link_materialow} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: 'var(--brand)', textDecoration: 'none' }}>📎 Materiały</a>}
                                      </div>
                                      {z.opis && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.5 }}>{z.opis}</div>}
                                      {/* Odpowiedzi */}
                                      {odp.length > 0 && (
                                        <div style={{ marginTop: '8px', background: 'var(--bg)', borderRadius: '8px', padding: '8px 10px' }}>
                                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                                            Przesłane prace ({odp.length})
                                          </div>
                                          {odp.map(o => (
                                            <div key={o.id} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>{o.imie} {o.nazwisko}</span>
                                              <a href={o.link_pracy} target="_blank" rel="noopener noreferrer"
                                                style={{ fontSize: '11px', color: 'var(--brand)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                                → Otwórz pracę
                                              </a>
                                              {o.komentarz && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{o.komentarz}</span>}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {odp.length === 0 && <span style={{ fontSize: '11px', color: '#ccc', marginTop: '4px', display: 'block' }}>Brak przesłanych prac</span>}
                                    </div>
                                    <button onClick={() => usunZadanie(z.id)}
                                      style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px', padding: '0 2px', flexShrink: 0 }}>×</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </>
        )}

        {/* ZAKŁADKA: Obecności w panelu biura */}
        {aktywnaZakladka === 'obecnosci' && (
          <AdminObecnosci grupy={grupy} zjazdy={zjazdy} />
        )}

        {/* ZAKŁADKA: Prowadzący */}
        {aktywnaZakladka === 'prowadzacy' && (
          <>
            {/* ── NARZĘDZIE DOSTĘPNOŚCI ── */}
            <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '18px 20px', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--brand-dark)', marginBottom: '4px' }}>Kto ma wolne w danym dniu?</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>Wpisz datę — zobaczysz którzy prowadzący nie mają w tym dniu zajęć</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="date" value={dostepnoscData} onChange={e => setDostepnoscData(e.target.value)}
                  style={{ fontSize: '13px', padding: '8px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif' }} />
                {dostepnoscData && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(dostepnoscData + 'T12:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>}
              </div>

              {dostepnoscData && (() => {
                // Zbierz id prowadzących zajętych w tym dniu
                const zajeciIds = new Set<number>();
                zjazdy.forEach(z => {
                  const dni = [z.data_dzien1, z.data_dzien2].filter(Boolean);
                  if (dni.some(d => d && d.substring(0, 10) === dostepnoscData)) {
                    (z.prowadzacy || []).forEach(p => zajeciIds.add(p.id));
                  }
                });

                const wolni = prowadzacy.filter(p => !zajeciIds.has(p.id));
                const zajeci = prowadzacy.filter(p => zajeciIds.has(p.id));

                return (
                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Wolni */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        ✓ Wolni ({wolni.length})
                      </div>
                      {wolni.length === 0
                        ? <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Wszyscy zajęci</div>
                        : wolni.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#f0faf4', borderRadius: '8px', marginBottom: '4px', border: '0.5px solid #c8e6c9' }}>
                            {p.avatar_url
                              ? <img src={p.avatar_url} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
                              : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#2e7d32', flexShrink: 0 }}>{p.imie[0]}{p.nazwisko[0]}</div>
                            }
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 500, color: '#1b5e20' }}>{p.imie} {p.nazwisko}{p.miasto && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '6px' }}>📍 {p.miasto}</span>}</div>
                              {(p.email || p.telefon) && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                  {p.email && <a href={`mailto:${p.email}`} style={{ fontSize: '10px', color: '#2e7d32', textDecoration: 'none' }}>✉ {p.email}</a>}
                                  {p.telefon && <a href={`tel:${p.telefon}`} style={{ fontSize: '10px', color: '#2e7d32', textDecoration: 'none' }}>📞 {p.telefon}</a>}
                                </div>
                              )}
                              {p.notatki && <div style={{ fontSize: '10px', color: '#c8a84b', marginTop: '2px', fontStyle: 'italic' }}>⚠ {p.notatki}</div>}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    {/* Zajęci */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#c62828', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        ✕ Zajęci ({zajeci.length})
                      </div>
                      {zajeci.length === 0
                        ? <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nikt nie ma zajęć</div>
                        : zajeci.map(p => {
                          // Pokaż w jakich grupach ma zajęcia tego dnia
                          const grupeNazwy = zjazdy
                            .filter(z => {
                              const dni = [z.data_dzien1, z.data_dzien2].filter(Boolean);
                              return dni.some(d => d && d.substring(0, 10) === dostepnoscData) && (z.prowadzacy || []).some(x => x.id === p.id);
                            })
                            .map(z => grupy.find(g => g.id === z.grupa_id)?.nazwa || '?');
                          return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: '#fff5f5', borderRadius: '8px', marginBottom: '4px', border: '0.5px solid #ffcdd2' }}>
                              {p.avatar_url
                                ? <img src={p.avatar_url} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffcdd2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#c62828', flexShrink: 0 }}>{p.imie[0]}{p.nazwisko[0]}</div>
                              }
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 500, color: '#b71c1c' }}>{p.imie} {p.nazwisko}</div>
                                <div style={{ fontSize: '10px', color: '#e57373' }}>{grupeNazwy.join(', ')}</div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                );
              })()}
            </div>

            <h2 className="page-title">Nowy prowadzący</h2>
            <form className="admin-form" onSubmit={dodajProwadzacego}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="login-field" style={{ flex: 1 }}><label>Imię</label><input type="text" value={nowyProwadzacy.imie} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, imie: e.target.value })} required /></div>
                <div className="login-field" style={{ flex: 1 }}><label>Nazwisko</label><input type="text" value={nowyProwadzacy.nazwisko} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, nazwisko: e.target.value })} required /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="login-field" style={{ flex: 1 }}><label>Email</label><input type="email" value={nowyProwadzacy.email} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, email: e.target.value })} placeholder="architekt@email.pl" /></div>
                <div className="login-field" style={{ flex: 1 }}><label>Telefon</label><input type="text" value={nowyProwadzacy.telefon} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, telefon: e.target.value })} placeholder="+48 600 000 000" /></div>
                <div className="login-field" style={{ flex: 1 }}><label>Miasto</label><input type="text" value={nowyProwadzacy.miasto} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, miasto: e.target.value })} placeholder="Warszawa" /></div>
              </div>
              <div className="login-field"><label>Link do zdjęcia (URL)</label><input type="url" value={nowyProwadzacy.avatar_url} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, avatar_url: e.target.value })} placeholder="https://..." /></div>
              <div className="login-field"><label>Opis / biogram</label><textarea value={nowyProwadzacy.bio} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, bio: e.target.value })} rows={2} placeholder="Krótki opis widoczny dla kursantów…" style={{ width: '100%', fontSize: '13px', padding: '8px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} /></div>
              <div className="login-field"><label>Notatki wewnętrzne</label><textarea value={nowyProwadzacy.notatki} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, notatki: e.target.value })} rows={2} placeholder="Np. nie może weekendowo, dostępny od września…" style={{ width: '100%', fontSize: '13px', padding: '8px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} /></div>
              <button className="login-btn" type="submit">Dodaj prowadzącego</button>
            </form>

            {/* ── FILTRY + LISTA PROWADZĄCYCH ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 className="page-title" style={{ margin: 0 }}>Lista prowadzących ({prowadzacy.length})</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Filtr miasto */}
                <select value={filtrMiastoProw} onChange={e => setFiltrMiastoProw(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                  <option value="">Wszystkie miasta</option>
                  {[...new Set(prowadzacy.map(p => p.miasto).filter(Boolean))].sort().map(m => (
                    <option key={m} value={m as string}>{m}</option>
                  ))}
                </select>
                {/* Filtr dostępność */}
                <select value={filtrDostepnoscProw} onChange={e => setFiltrDostepnoscProw(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                  <option value="">Wszyscy</option>
                  <option value="wolni">Wolni dziś</option>
                  <option value="zajeci">Zajęci dziś</option>
                </select>
              </div>
            </div>

            {prowadzacy.length === 0 && (
              <div className="profil-card"><div className="profil-row"><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Brak prowadzących.</span></div></div>
            )}

            {prowadzacy
              .filter(p => {
                if (filtrMiastoProw && p.miasto !== filtrMiastoProw) return false;
                if (filtrDostepnoscProw) {
                  const dzisiaj = new Date().toISOString().split('T')[0];
                  const maZajecia = zjazdy.some(z => {
                    const dni = [z.data_dzien1, z.data_dzien2].filter(Boolean);
                    return dni.some(d => d && d.substring(0, 10) === dzisiaj) && (z.prowadzacy || []).some(x => x.id === p.id);
                  });
                  if (filtrDostepnoscProw === 'wolni' && maZajecia) return false;
                  if (filtrDostepnoscProw === 'zajeci' && !maZajecia) return false;
                }
                return true;
              })
              .map(p => {
                const rozwiniety = rozwinietaProwadzacy.has(p.id);
                const przypisaneZjazdy = zjazdy.filter(z => (z.prowadzacy || []).some(x => x.id === p.id));
                const dzisiaj = new Date().toISOString().split('T')[0];
                const maZajeciaToday = zjazdy.some(z => {
                  const dni = [z.data_dzien1, z.data_dzien2].filter(Boolean);
                  return dni.some(d => d && d.substring(0, 10) === dzisiaj) && (z.prowadzacy || []).some(x => x.id === p.id);
                });
                return (
                  <div key={p.id} style={{ marginBottom: '8px', background: 'white', borderRadius: rozwiniety ? '14px 14px 14px 14px' : '14px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                    {/* Nagłówek — zawsze widoczny */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }}
                      onClick={() => setRozwinietaProwadzacy(prev => {
                        const next = new Set(prev);
                        next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                        return next;
                      })}>
                      {/* Avatar */}
                      {p.avatar_url
                        ? <img src={p.avatar_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--brand-dark)', flexShrink: 0 }}>{p.imie[0]}{p.nazwisko[0]}</div>
                      }
                      {/* Imię + miasto */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                          {p.imie} {p.nazwisko}
                          {maZajeciaToday && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ffeaea', color: '#c62828', padding: '1px 6px', borderRadius: '6px', fontWeight: 600 }}>zajęty dziś</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                          {p.miasto && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {p.miasto}</span>}
                          {p.email && <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: '11px', color: 'var(--brand)', textDecoration: 'none' }}>✉ {p.email}</a>}
                          {p.telefon && <a href={`tel:${p.telefon}`} onClick={e => e.stopPropagation()} style={{ fontSize: '11px', color: '#2e7d32', textDecoration: 'none' }}>📞 {p.telefon}</a>}
                        </div>
                        {p.notatki && <div style={{ fontSize: '10px', color: '#c8a84b', marginTop: '2px', fontStyle: 'italic' }}>⚠ {p.notatki}</div>}
                        {przypisaneZjazdy.length > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {przypisaneZjazdy.length} {przypisaneZjazdy.length === 1 ? 'zjazd' : 'zjazdów'} · {[...new Set(przypisaneZjazdy.map(z => grupy.find(g => g.id === z.grupa_id)?.nazwa).filter(Boolean))].join(', ')}
                          </div>
                        )}
                      </div>
                      {/* Akcje + strzałka */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', transform: rozwiniety ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                        <button onClick={e => { e.stopPropagation(); usunProwadzacego(p.id); }}
                          style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>×</button>
                      </div>
                    </div>

                    {/* Szczegóły — zwijane */}
                    {rozwiniety && (
                      <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border-soft)' }}>
                        {/* Kontakt */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                          <div style={{ flex: 1, minWidth: '160px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Email</label>
                            <input type="email" defaultValue={p.email || ''} placeholder="architekt@email.pl"
                              onBlur={async e => { if (e.target.value.trim() !== (p.email || '').trim()) { await supabase.from('prowadzacy').update({ email: e.target.value.trim() || null }).eq('id', p.id); pobierzProwadzacy(); }}}
                              style={{ width: '100%', fontSize: '12px', padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Telefon</label>
                            <input type="text" defaultValue={p.telefon || ''} placeholder="+48 600 000 000"
                              onBlur={async e => { if (e.target.value.trim() !== (p.telefon || '').trim()) { await supabase.from('prowadzacy').update({ telefon: e.target.value.trim() || null }).eq('id', p.id); pobierzProwadzacy(); }}}
                              style={{ width: '100%', fontSize: '12px', padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: '110px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Miasto</label>
                            <input type="text" defaultValue={p.miasto || ''} placeholder="Warszawa"
                              onBlur={async e => { if (e.target.value.trim() !== (p.miasto || '').trim()) { await supabase.from('prowadzacy').update({ miasto: e.target.value.trim() || null }).eq('id', p.id); pobierzProwadzacy(); }}}
                              style={{ width: '100%', fontSize: '12px', padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif' }} />
                          </div>
                        </div>
                        {/* Opis */}
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Opis (widoczny dla kursantów)</label>
                          <textarea defaultValue={p.bio || ''} rows={2} placeholder="Krótki opis…"
                            onBlur={async e => { const nowe = e.target.value.trim(); if (nowe !== (p.bio || '').trim()) { await supabase.from('prowadzacy').update({ bio: nowe || null }).eq('id', p.id); pobierzProwadzacy(); }}}
                            style={{ width: '100%', fontSize: '12px', padding: '6px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} />
                        </div>
                        {/* Notatki */}
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 600, color: '#c8a84b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>🔒 Notatki wewnętrzne</label>
                          <textarea defaultValue={p.notatki || ''} rows={2} placeholder="Np. nie może weekendowo, dostępny od września…"
                            onBlur={async e => { const nowe = e.target.value.trim(); if (nowe !== (p.notatki || '').trim()) { await supabase.from('prowadzacy').update({ notatki: nowe || null }).eq('id', p.id); pobierzProwadzacy(); }}}
                            style={{ width: '100%', fontSize: '12px', padding: '6px 8px', border: '0.5px solid #fef3c7', borderRadius: '7px', fontFamily: 'Jost, sans-serif', resize: 'vertical', background: '#fffbeb' }} />
                        </div>
                        {/* Link do zdjęcia */}
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Link do zdjęcia</label>
                          <input type="url" defaultValue={p.avatar_url || ''} placeholder="https://..."
                            onBlur={async e => { const nowe = e.target.value.trim(); if (nowe !== (p.avatar_url || '').trim()) { await supabase.from('prowadzacy').update({ avatar_url: nowe || null }).eq('id', p.id); pobierzProwadzacy(); }}}
                            style={{ width: '100%', fontSize: '12px', padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif' }} />
                        </div>
                        {/* Zjazdy */}
                        {przypisaneZjazdy.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>Przypisane zjazdy</label>
                            {przypisaneZjazdy.map(z => (
                              <div key={z.id} style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '3px 0', borderBottom: '0.5px solid var(--border-soft)' }}>
                                Zjazd {z.nr} · {z.daty} · <span style={{ color: 'var(--brand)' }}>{grupy.find(g => g.id === z.grupa_id)?.nazwa || '?'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </>
        )}
      </main>
      </div>
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

  const noweOgloszenia = ogloszenia.filter(o => o.nowe);

  return (
    <>
      <p className="greeting">Dzień dobry, {imie}</p>

      {/* Baner nowych ogłoszeń */}
      {noweOgloszenia.length > 0 && (
        <div onClick={() => onNavigate('ogloszenia')} style={{
          background: 'var(--brand-dark)', borderRadius: '14px', padding: '14px 16px',
          marginBottom: '16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>📢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>
              {noweOgloszenia.length === 1 ? 'Nowe ogłoszenie' : `${noweOgloszenia.length} nowe ogłoszenia`}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              {noweOgloszenia[0].tytul}
            </div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>→</span>
        </div>
      )}
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
            {najblizszy.typ === 'online' ? (
              <div className="hero-pills">
                <span className="pill">🌐 Zajęcia online</span>
                {najblizszy.link_online && (
                  <a href={najblizszy.link_online} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,0.3)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    Dołącz
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="hero-sub">{kursant?.grupy?.miasto || 'Warszawa'}</div>
                <div className="hero-pills">
                  <span className="pill">{najblizszy.sala}</span>
                  <span className="pill">{najblizszy.adres}</span>
                </div>
              </>
            )}
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


type KafelekDniaProps = {
  zjazd: Zjazd;
  dzien: 1 | 2;
  label: string;
  wpis: Obecnosc | undefined;
  aktywnyFormularz: { zjazdId: number; dzien: 1 | 2; typ: string; powod?: string; godzPrzyb?: string; godzWyj?: string } | null;
  setAktywnyFormularz: (v: any) => void;
  zapiszObecnosc: (zjazd: Zjazd, dzien: 1 | 2, status: 'potwierdzono' | 'nieobecnosc') => void;
  usunObecnosc: (zjazdId: number, dzien: 1 | 2) => void;
  odswiezObecnosci: () => void;
  wysylanie: boolean;
};

function KafelekDnia({ zjazd, dzien, label, wpis, aktywnyFormularz, setAktywnyFormularz, zapiszObecnosc, usunObecnosc, odswiezObecnosci, wysylanie }: KafelekDniaProps) {
  const zakonczone = zjazd.status === 'zakonczony';
  const formularzAktywny = aktywnyFormularz?.zjazdId === zjazd.id && aktywnyFormularz?.dzien === dzien;

  const kolorTla = zakonczone
    ? (wpis?.status === 'potwierdzono' ? '#f5faf6' : wpis?.status === 'nieobecnosc' ? '#fdf5f5' : '#f8f8f8')
    : (!wpis ? 'var(--surface-2)' : wpis.status === 'potwierdzono' ? '#f0faf4' : '#fff8f8');
  const kolorObramowania = zakonczone
    ? (wpis?.status === 'potwierdzono' ? '#c8dfc8' : wpis?.status === 'nieobecnosc' ? '#f0c0c0' : 'var(--border)')
    : (!wpis ? 'var(--border)' : wpis.status === 'potwierdzono' ? '#7aab8a' : '#e57373');

  return (
    <div style={{ flex: 1, borderRadius: '12px', border: `0.5px solid ${kolorObramowania}`, background: kolorTla, padding: '10px 12px', opacity: zakonczone && !wpis ? 0.5 : 1 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: zakonczone ? '#aaa' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>{label}</div>

      {zakonczone && (
        <div style={{ marginBottom: '4px' }}>
          {wpis?.status === 'potwierdzono' && (
            <span style={{ fontSize: '12px', color: '#5a8a5a', fontWeight: 500 }}>✓ Obecny/a{wpis.zweryfikowano ? ' · zweryfikowano' : ''}</span>
          )}
          {wpis?.status === 'nieobecnosc' && (
            <div>
              <span style={{ fontSize: '12px', color: '#b06060', fontWeight: 500 }}>✕ Nieobecny/a{wpis.zweryfikowano ? ' · zweryfikowano' : ''}</span>
              {wpis.powod_nieobecnosci && <p style={{ fontSize: '11px', color: '#aaa', marginTop: '2px', fontStyle: 'italic' }}>{wpis.powod_nieobecnosci}</p>}
            </div>
          )}
          {!wpis && <span style={{ fontSize: '12px', color: '#bbb' }}>Brak zgłoszenia</span>}
        </div>
      )}

      {!zakonczone && wpis && (
        <div style={{ marginBottom: '6px' }}>
          {wpis.status === 'potwierdzono' ? (
            <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>✓ Potwierdzono{wpis.zweryfikowano ? ' · ✓ zweryfikowano' : ''}</span>
          ) : (
            <div>
              <span style={{ fontSize: '11px', color: '#c62828', fontWeight: 600 }}>✕ Nieobecność{wpis.zweryfikowano ? ' · ✓ zweryfikowano' : ''}</span>
              {wpis.powod_nieobecnosci && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>{wpis.powod_nieobecnosci}</p>}
            </div>
          )}
        </div>
      )}

      {formularzAktywny && aktywnyFormularz?.typ === 'nieobecnosc' && (
        <div style={{ marginBottom: '8px' }}>
          <textarea
            value={aktywnyFormularz.powod || ''}
            onChange={e => setAktywnyFormularz({ ...aktywnyFormularz, powod: e.target.value })}
            placeholder="Powód nieobecności..."
            rows={2}
            style={{ width: '100%', fontSize: '12px', padding: '6px 8px', borderRadius: '8px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button onClick={() => zapiszObecnosc(zjazd, dzien, 'nieobecnosc')} disabled={wysylanie}
              style={{ flex: 1, padding: '7px', borderRadius: '8px', background: '#c62828', color: 'white', border: 'none', fontSize: '11px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
              {wysylanie ? '...' : 'Wyślij'}
            </button>
            <button onClick={() => setAktywnyFormularz(null)}
              style={{ padding: '7px 10px', borderRadius: '8px', background: 'white', border: '0.5px solid var(--border)', fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {formularzAktywny && aktywnyFormularz?.typ === 'godziny' && (
        <div style={{ marginBottom: '8px', background: '#fef9ec', borderRadius: '10px', padding: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Odnotuj spóźnienie / wczesne wyjście</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>Przybycie (jeśli późno)</div>
              <input type="time" value={aktywnyFormularz.godzPrzyb || ''}
                onChange={e => setAktywnyFormularz({ ...aktywnyFormularz, godzPrzyb: e.target.value })}
                style={{ width: '100%', fontSize: '12px', padding: '5px 8px', borderRadius: '8px', border: '0.5px solid var(--border)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>Wyjście (jeśli wcześnie)</div>
              <input type="time" value={aktywnyFormularz.godzWyj || ''}
                onChange={e => setAktywnyFormularz({ ...aktywnyFormularz, godzWyj: e.target.value })}
                style={{ width: '100%', fontSize: '12px', padding: '5px 8px', borderRadius: '8px', border: '0.5px solid var(--border)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={async () => {
              if (wpis) {
                await supabase.from('obecnosci').update({
                  godzina_przybycia: aktywnyFormularz.godzPrzyb || null,
                  godzina_wyjscia: aktywnyFormularz.godzWyj || null,
                }).eq('id', wpis.id);
                await odswiezObecnosci();
              }
              setAktywnyFormularz(null);
            }} style={{ flex: 1, padding: '7px', borderRadius: '8px', background: 'var(--brand)', color: 'white', border: 'none', fontSize: '11px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
              Zapisz
            </button>
            <button onClick={() => setAktywnyFormularz(null)}
              style={{ padding: '7px 10px', borderRadius: '8px', background: 'white', border: '0.5px solid var(--border)', fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {!zakonczone && !formularzAktywny && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(!wpis || wpis.status === 'nieobecnosc') && (
            <button onClick={() => zapiszObecnosc(zjazd, dzien, 'potwierdzono')} disabled={wysylanie}
              style={{ flex: 1, padding: '6px 4px', borderRadius: '8px', background: '#e8f5e9', color: '#2e7d32', border: '0.5px solid #c8e6c9', fontSize: '11px', cursor: 'pointer', fontWeight: 500, fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
              ✓ Będę
            </button>
          )}
          {(!wpis || wpis.status === 'potwierdzono') && (
            <button onClick={() => setAktywnyFormularz({ zjazdId: zjazd.id, dzien, typ: 'nieobecnosc', powod: '' })}
              style={{ flex: 1, padding: '6px 4px', borderRadius: '8px', background: '#fff8f8', color: '#c62828', border: '0.5px solid #ffcdd2', fontSize: '11px', cursor: 'pointer', fontWeight: 500, fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
              ✕ Nie będę
            </button>
          )}
          {wpis && wpis.status === 'potwierdzono' && (
            <button onClick={() => setAktywnyFormularz({ zjazdId: zjazd.id, dzien, typ: 'godziny', godzPrzyb: wpis.godzina_przybycia || '', godzWyj: wpis.godzina_wyjscia || '' })}
              style={{ padding: '6px 8px', borderRadius: '8px', background: '#fef9ec', color: '#c8a84b', border: '0.5px solid #f0d080', fontSize: '11px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
              🕐 Spóźnienie
            </button>
          )}
          {wpis && (
            <button onClick={() => usunObecnosc(zjazd.id, dzien)}
              style={{ padding: '6px 8px', borderRadius: '8px', background: 'white', border: '0.5px solid var(--border)', fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EkranZjazdy({ zjazdy, user, kursant }: { zjazdy: Zjazd[]; user: User; kursant: Kursant | null }) {
  const [obecnosci, setObecnosci] = useState<Obecnosc[]>([]);
  const [modalProwadzacy, setModalProwadzacy] = useState<Prowadzacy | null>(null);
  const [aktywnyFormularz, setAktywnyFormularz] = useState<{ zjazdId: number; dzien: 1 | 2; typ: 'obecnosc' | 'nieobecnosc' | 'godziny'; powod?: string; godzPrzyb?: string; godzWyj?: string } | null>(null);
  const [wysylanie, setWysylanie] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('obecnosci').select('*').eq('user_id', user.id)
      .then(({ data }) => setObecnosci(data || []));
  }, [user]);

  async function odswiezObecnosci() {
    const { data } = await supabase.from('obecnosci').select('*').eq('user_id', user.id);
    setObecnosci(data || []);
  }

  const pobierzDzien = (zjazdId: number, dzien: 1 | 2) =>
    obecnosci.find(o => o.zjazd_id === zjazdId && o.dzien === dzien);

  async function zapiszObecnosc(zjazd: Zjazd, dzien: 1 | 2, status: 'potwierdzono' | 'nieobecnosc') {
    if (!kursant) return;
    setWysylanie(true);
    const istniejaca = pobierzDzien(zjazd.id, dzien);
    const powod = aktywnyFormularz?.powod || '';
    const godzinaData = {
      godzina_przybycia: aktywnyFormularz?.godzPrzyb || null,
      godzina_wyjscia: aktywnyFormularz?.godzWyj || null,
    };
    if (istniejaca) {
      await supabase.from('obecnosci').update({
        status, powod_nieobecnosci: status === 'nieobecnosc' ? powod : null,
        zweryfikowano: false, ...godzinaData,
      }).eq('id', istniejaca.id);
    } else {
      await supabase.from('obecnosci').insert([{
        zjazd_id: zjazd.id, user_id: user.id,
        grupa_id: kursant.grupa_id, imie: kursant.imie, nazwisko: kursant.nazwisko,
        dzien, status, powod_nieobecnosci: status === 'nieobecnosc' ? powod : null,
        ...godzinaData,
      }]);
    }
    await odswiezObecnosci();
    setAktywnyFormularz(null);
    setWysylanie(false);
  }

  async function usunObecnosc(zjazdId: number, dzien: 1 | 2) {
    await supabase.from('obecnosci').delete().eq('zjazd_id', zjazdId).eq('user_id', user.id).eq('dzien', dzien);
    await odswiezObecnosci();
  }




  return (
    <>
      <h2 className="page-title">Plan zjazdów</h2>
      {zjazdy.map((z) => (
        <div key={z.id} className={`sess-card ${z.status}`}>
          <div className="sess-top">
            <span className="sess-nr">Zjazd {z.nr}</span>
            <span className={`s-badge s-${z.status}`}>{z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}</span>
          </div>
          <div className="sess-date">{z.daty}</div>
          {z.typ === 'online' && (
            <div style={{ padding: '6px 14px 2px' }}>
              <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 600, background: '#e8f0fe', color: '#1565c0', padding: '3px 10px', borderRadius: '20px', marginBottom: '6px' }}>
                🌐 Zajęcia online
              </span>
            </div>
          )}
          <div className="sess-rows">
            {z.typ === 'online' ? (
              z.link_online && (
                <div className="sess-row" style={{ paddingBottom: '4px' }}>
                  <a href={z.link_online} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1565c0', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    Dołącz do zajęć
                  </a>
                </div>
              )
            ) : (
              <>
                {z.sala && z.sala !== 'Do uzupełnienia' && <div className="sess-row"><span className="sess-lbl">Sala:</span> {z.sala}</div>}
                {z.adres && z.adres !== 'Do uzupełnienia' && <div className="sess-row"><span className="sess-lbl">Adres:</span> {z.adres}</div>}
              </>
            )}
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

          {/* Kafelki per dzień */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px 14px 14px' }}>
            <KafelekDnia zjazd={z} dzien={1} wpis={obecnosci.find(o => o.zjazd_id === z.id && o.dzien === 1)} aktywnyFormularz={aktywnyFormularz} setAktywnyFormularz={setAktywnyFormularz} zapiszObecnosc={zapiszObecnosc} usunObecnosc={usunObecnosc} odswiezObecnosci={odswiezObecnosci} wysylanie={wysylanie} label={z.data_dzien1 ? new Date(z.data_dzien1).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Dzień 1'} />
            {z.data_dzien2 && <KafelekDnia zjazd={z} dzien={2} wpis={obecnosci.find(o => o.zjazd_id === z.id && o.dzien === 2)} aktywnyFormularz={aktywnyFormularz} setAktywnyFormularz={setAktywnyFormularz} zapiszObecnosc={zapiszObecnosc} usunObecnosc={usunObecnosc} odswiezObecnosci={odswiezObecnosci} wysylanie={wysylanie} label={new Date(z.data_dzien2).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })} />}
          </div>
        </div>
      ))}
      {modalProwadzacy && <ModalProwadzacy p={modalProwadzacy} onZamknij={() => setModalProwadzacy(null)} />}
    </>
  );
}

function EkranOgloszenia({ ogloszenia, onOtworzOgloszenie }: { ogloszenia: Ogloszenie[]; onOtworzOgloszenie: (o: Ogloszenie) => void }) {
  return (
    <>
      <h2 className="page-title">Ogłoszenia</h2>
      {ogloszenia.map((o) => <KartaOgloszenia key={o.id} o={o} onClick={() => onOtworzOgloszenie(o)} />)}
      {ogloszenia.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Brak ogłoszeń.
        </div>
      )}
      {/* Kontakt z biurem */}
      <div style={{
        marginTop: '24px', padding: '16px 18px', borderRadius: '16px',
        background: 'var(--brand-light)', border: '0.5px solid var(--border-soft)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-dark)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kontakt z biurem</div>
        <a href="tel:883659069" style={{ display: 'block', fontSize: '18px', fontWeight: 600, color: 'var(--brand-dark)', textDecoration: 'none', marginBottom: '4px' }}>
          +48 533 718 412
        </a>
        <a href="mailto:info@on-arch.pl" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
          info@on-arch.pl
        </a>
      </div>
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

      {/* Certyfikat — zawsze widoczny */}
      {kursant?.certyfikat_url ? (
        <a href={kursant.certyfikat_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '16px 18px',
            border: '0.5px solid #d4af7a', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef9ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🎓</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Certyfikat ukończenia</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kliknij aby pobrać</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#c8a84b', fontSize: '18px' }}>→</span>
          </div>
        </a>
      ) : (
        <div style={{
          background: '#f8f8f8', borderRadius: '16px', padding: '16px 18px',
          border: '0.5px dashed #d0d0d0', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '14px',
          opacity: 0.65,
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🎓</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#aaa', marginBottom: '2px' }}>Certyfikat ukończenia</div>
            <div style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.5 }}>
              Pojawi się po zakończeniu kursu,{'\n'}wypełnieniu ankiety i przesłaniu pracy zaliczeniowej
            </div>
          </div>
          <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: '18px' }}>🔒</span>
        </div>
      )}

      {/* Ankieta — zawsze widoczna */}
      {ankietaDostepna ? (
        <div onClick={onOtworzAnkiete} style={{
          background: 'var(--brand-dark)', borderRadius: '16px', padding: '16px 18px',
          marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px',
          cursor: 'pointer',
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>⭐</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>Ankieta oceny kursu</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Twoja opinia jest dla nas ważna — wypełnij!</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'white', fontSize: '18px' }}>→</span>
        </div>
      ) : (
        <div style={{
          background: '#f8f8f8', borderRadius: '16px', padding: '16px 18px',
          border: '0.5px dashed #d0d0d0', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '14px',
          opacity: 0.65,
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>⭐</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#aaa', marginBottom: '2px' }}>Ankieta oceny kursu</div>
            <div style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.5 }}>Odblokuje się po zakończeniu ostatniego zjazdu</div>
          </div>
          <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: '18px' }}>🔒</span>
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
        setKursant({ imie: '', nazwisko: '', grupa_id: 0, rola: 'prowadzacy', avatar_url: null, certyfikat_url: null, onboarding_done: true, grupy: null });
        setLadowanie(false);
        return;
      }

      const { data: kursantData } = await supabase.from('kursanci').select('imie, nazwisko, grupa_id, rola, avatar_url, certyfikat_url, onboarding_done').eq('user_id', user!.id).single();
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
  if (kursant && !kursant.onboarding_done) return <EkranPowitalny kursant={kursant} user={user} onDalej={() => setKursant(prev => prev ? { ...prev, onboarding_done: true } : prev)} />;

  return (
    <div className="app">
      <header className="header">
        <OnArchLogo height={22} color="var(--brand-dark)" />
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