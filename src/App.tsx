  import { useState, useEffect, useRef } from 'react';
  import './App.css';
  import { supabase } from './supabase';
  const VAPID_PUBLIC_KEY = 'BFAbFXIqcGQtsjB0EWALrzt14OOGbPsEZtK2RHuz2R5REYhBtiUOg_H1vjq6XiwdnyJnyftcY0dM8bLuWcqba7o';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
  import { Home, Calendar, Bell, MessageCircle, User, CheckSquare, BookOpen, Star } from 'lucide-react';
  import * as Sentry from '@sentry/react';

  Sentry.init({
    dsn: 'https://17a9858837be5d5176d95b789e13fb9f@o4511088619094016.ingest.de.sentry.io/4511088625647696',
    environment: 'production',
    tracesSampleRate: 0.2,
  });

  // Przelicza status zjazdu na podstawie dat — nie z bazy danych
  function przeliczStatus(z: { data_dzien1?: string | null; data_dzien2?: string | null; status: string }): string {
    const dzisiaj = new Date().toISOString().split('T')[0];
    if (!z.data_dzien1) return z.status; // brak dat — status z bazy (kursy bez określonych dni)
    const ostatniDzien = (z.data_dzien2 || z.data_dzien1).substring(0, 10);
    return ostatniDzien < dzisiaj ? 'zakonczony' : 'nadchodzacy';
  }

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
    autor_user_id: string | null;
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
    zdjecie_url?: string | null;
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
    uwagi_prowadzacego: string | null;
    sprawdzona: boolean | null;
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
    zdjecie_url?: string | null;
    prowadzacy?: Prowadzacy[];
  };

  type MaterialZjazdu = {
    id: number;
    zjazd_id: number;
    tytul: string;
    link: string | null;
    kolejnosc: number;
  };

  type PytanieZjazdu = {
    id: number;
    zjazd_id: number;
    user_id: string;
    imie: string;
    nazwisko: string;
    tresc: string;
    omowione: boolean;
    created_at: string;
  };

  // Czy grupa używa modelu odwróconej klasy (PWO lub POO)
  function czyOdwroconaKlasa(nazwaGrupy: string): boolean {
    return nazwaGrupy.startsWith('PWO') || nazwaGrupy.startsWith('POO');
  }

  type Kursant = {
    imie: string;
    nazwisko: string;
    email?: string;
    grupa_id: number;
    rola: string;
    avatar_url: string | null;
    certyfikat_url: string | null;
    folder_prywatny?: string | null;
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
  type MaterialZakupu = {
    id: string;
    nazwa: string;
    opis: string | null;
    cena: string | null;
    zdjecie_url: string | null;
    link_sklepu: string | null;
    kolejnosc: number;
  };

  type ZdjecieAplikacji = {
    id: string;
    kategoria: string;
    url: string;
    nazwa: string;
    kolejnosc: number;
    tag?: string | null;
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
    const [pokazWyslane, setPokazWyslane] = useState(false);
  
    const SERIF = "'Cormorant Garamond', Georgia, serif";
    const [dbPhotos, setDbPhotos] = useState<string[]>([]);
  const PHOTOS_FALLBACK = [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=900&q=80',
  ];
  const PHOTOS = dbPhotos.length > 0 ? dbPhotos : PHOTOS_FALLBACK;

  useEffect(() => {
    const kat = 'zadania'; // lub 'zadania' w EkranZadania
    supabase.from('zdjecia_aplikacji').select('url').eq('kategoria', kat).order('kolejnosc')
      .then(({ data }) => { if (data && data.length > 0) setDbPhotos(data.map(z => z.url)); });
  }, []);
    const KOLORY = ['#B35758', '#E9A72D', '#6B9C68', '#B35758', '#6B9C68'];
  
    useEffect(() => { if (!kursant?.grupa_id) return; pobierz(); }, [kursant]);
  
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
        await supabase.from('zadania_odpowiedzi').insert([{ zadanie_id: zadanie.id, user_id: user.id, imie: kursant.imie, nazwisko: kursant.nazwisko, link_pracy: linkPracy, komentarz: komentarz || null }]);
      }
      setAktywneZadanie(null); setLinkPracy(''); setKomentarz('');
      await pobierz();
      setWysylanie(false);
    }
  
    if (!kursant?.grupa_id) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nie jesteś przypisana do żadnej grupy.</div>;
  
    const pracaZaliczeniowa = zadania.filter(z => z.typ === 'praca_zaliczeniowa');
    const aktywne = zadania.filter(z => z.typ !== 'praca_zaliczeniowa' && !odpowiedzDlaZadania(z.id));
    const wyslane = zadania.filter(z => z.typ !== 'praca_zaliczeniowa' && !!odpowiedzDlaZadania(z.id));
  
    function FormPrzeslania({ zadanie }: { zadanie: Zadanie }) {
      return (
        <div style={{ padding: '14px 16px', borderTop: '0.5px solid var(--border-soft)', background: '#fffbf5' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px', padding: '10px 12px', background: '#fef9ec', borderRadius: '10px', border: '0.5px solid #fde68a' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
            <div style={{ fontSize: '11.5px', color: '#92400e', lineHeight: 1.6 }}>
              Dodaj link do <strong>Google Drive</strong> i ustaw uprawnienia: <strong>każda osoba z linkiem → Przeglądający</strong>.
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>Link do pracy</div>
            <input type="url" value={linkPracy} onChange={e => setLinkPracy(e.target.value)} placeholder="https://drive.google.com/..."
              style={{ width: '100%', fontSize: '13px', padding: '10px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', background: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>Komentarz <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcjonalnie)</span></div>
            <textarea value={komentarz} onChange={e => setKomentarz(e.target.value)} rows={2} placeholder="np. wersja robocza, czeka na poprawki..."
              style={{ width: '100%', fontSize: '13px', padding: '10px 12px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', resize: 'none', background: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => wyslij(zadanie)} disabled={wysylanie || !linkPracy.trim()}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: linkPracy.trim() ? 'var(--brand)' : '#ddd', color: 'white', fontSize: '13px', fontWeight: 600, cursor: linkPracy.trim() ? 'pointer' : 'default', fontFamily: 'Jost, sans-serif' }}>
              {wysylanie ? 'Wysyłanie...' : 'Prześlij pracę'}
            </button>
            <button onClick={() => { setAktywneZadanie(null); setLinkPracy(''); setKomentarz(''); }}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '0.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>
              Anuluj
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <>
        {/* Nagłówek */}
        <div style={{ padding: '4px 0 20px' }}>
          <div style={{ fontSize: '9.5px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            {aktywne.length > 0 ? `${aktywne.length} do przesłania` : pracaZaliczeniowa.length > 0 ? 'Zadania domowe' : 'Brak zadań'}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '38px', lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--text)' }}>Zadania</div>
        </div>
  
        {/* Skeleton */}
        {ladowanie && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', border: '0.5px solid var(--border)', height: '80px' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
              </div>
            ))}
          </div>
        )}
  
        {!ladowanie && zadania.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '22px', marginBottom: '8px' }}>Brak zadań</div>
            <div style={{ fontSize: '13px' }}>Pojawią się tutaj gdy prowadzący doda nowe.</div>
          </div>
        )}
  
        {/* ── PRACA ZALICZENIOWA ── */}
        {pracaZaliczeniowa.map(z => {
          const odp = odpowiedzDlaZadania(z.id);
          const wyslano = !!odp;
          const rozwinięte = aktywneZadanie?.id === z.id;
          return (
            <div key={z.id} style={{ marginBottom: '14px', borderRadius: '18px', overflow: 'hidden', border: wyslano ? '0.5px solid #b8d4b8' : '0.5px solid #e8d4a0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {/* Header karty */}
              <div style={{ background: wyslano ? 'linear-gradient(135deg, #2e7d32 0%, #4a7a47 100%)' : 'linear-gradient(135deg, #c8a84b 0%, #a07830 100%)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: '2px' }}>Praca zaliczeniowa</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>{z.tytul}</div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: wyslano ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.2)', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                  {wyslano ? '✓ Przesłana' : 'Do zrobienia'}
                </div>
              </div>
  
              {/* Body */}
              <div style={{ background: 'white', padding: '14px 18px' }}>
                {z.opis && <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '10px', whiteSpace: 'pre-line' }}>{renderTekstZLinkami(z.opis)}</div>}
                {z.link_materialow && (
                  <a href={z.link_materialow} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--brand)', textDecoration: 'none', marginBottom: '8px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    Materiały do zadania →
                  </a>
                )}
                {z.termin && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>Termin: {new Date(z.termin).toLocaleDateString('pl-PL')}</div>}
  
                {/* Wynik */}
                {wyslano && !rozwinięte && (
                  <div style={{ background: '#f0faf4', borderRadius: '12px', padding: '12px 14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Twoja praca</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: odp!.sprawdzona ? '#e8f5e9' : '#fff8e1', color: odp!.sprawdzona ? '#2e7d32' : '#c8a84b' }}>
                        {odp!.sprawdzona ? '✓ Sprawdzona' : '· Do sprawdzenia'}
                      </span>
                    </div>
                    <a href={odp!.link_pracy} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline', wordBreak: 'break-all' }}>{odp!.link_pracy}</a>
                    {odp!.komentarz && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{odp!.komentarz}</p>}
                    {odp!.uwagi_prowadzacego && (
                      <div style={{ marginTop: '8px', padding: '8px 10px', background: '#fffbeb', borderRadius: '8px', border: '0.5px solid #fef3c7' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#c8a84b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>💬 Uwagi prowadzącego</p>
                        <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{odp!.uwagi_prowadzacego}</p>
                      </div>
                    )}
                    <button onClick={() => { setAktywneZadanie(z); setLinkPracy(odp!.link_pracy); setKomentarz(odp!.komentarz || ''); }}
                      style={{ marginTop: '8px', fontSize: '12px', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', padding: 0 }}>
                      Edytuj odpowiedź
                    </button>
                  </div>
                )}
                {!wyslano && !rozwinięte && (
                  <button onClick={() => setAktywneZadanie(z)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#c8a84b', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                    Prześlij pracę zaliczeniową
                  </button>
                )}
              </div>
              {rozwinięte && <FormPrzeslania zadanie={z} />}
            </div>
          );
        })}
  
        {/* ── ZADANIA DOMOWE — AKTYWNE ── */}
        {aktywne.length > 0 && (
          <>
            {pracaZaliczeniowa.length > 0 && (
              <div style={{ fontSize: '9.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', marginTop: '4px' }}>Zadania domowe</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
              {aktywne.map((z, idx) => {
                const rozwinięte = aktywneZadanie?.id === z.id;
                const kolor = KOLORY[idx % KOLORY.length];
                const photo = z.zdjecie_url || PHOTOS[idx % PHOTOS.length];
                return (
                  <div key={z.id} style={{ background: 'white', borderRadius: '16px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                    <div onClick={() => !rozwinięte && setAktywneZadanie(z)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', cursor: rozwinięte ? 'default' : 'pointer' }}>
                      <div style={{ width: '4px', height: '52px', background: kolor, borderRadius: '2px', flexShrink: 0 }} />
                      <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: `url(${photo}) center/cover`, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.tytul}</div>
                        {z.opis && <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{z.opis}</div>}
                        {z.termin && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>do {new Date(z.termin).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</div>}
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {!rozwinięte
                          ? <div style={{ fontSize: '9px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: '#f0ece7', color: 'var(--brand-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', border: '0.5px solid var(--border)' }}>Do zrobienia</div>
                          : <button onClick={() => { setAktywneZadanie(null); setLinkPracy(''); setKomentarz(''); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)', lineHeight: 1, padding: '0 4px' }}>×</button>
                        }
                      </div>
                    </div>
                    {rozwinięte && (
                      <div style={{ borderTop: '0.5px solid var(--border-soft)', padding: '12px 14px' }}>
                        {z.opis && <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '10px', whiteSpace: 'pre-line' }}>{renderTekstZLinkami(z.opis)}</div>}
                        {z.link_materialow && (
                          <a href={z.link_materialow} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--brand)', textDecoration: 'none', marginBottom: '10px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                            Materiały →
                          </a>
                        )}
                      </div>
                    )}
                    {rozwinięte && <FormPrzeslania zadanie={z} />}
                  </div>
                );
              })}
            </div>
          </>
        )}
  
        {/* ── PRZESŁANE ── */}
        {wyslane.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <button onClick={() => setPokazWyslane(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 2px', marginBottom: '8px', fontFamily: 'inherit' }}>
              <span style={{ fontSize: '9.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Przesłane ({wyslane.length})</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-block', transform: pokazWyslane ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>▾</span>
            </button>
            {pokazWyslane && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {wyslane.map((z, idx) => {
                  const odp = odpowiedzDlaZadania(z.id)!;
                  const rozwinięte = aktywneZadanie?.id === z.id;
                  const photo = z.zdjecie_url || PHOTOS[(aktywne.length + idx) % PHOTOS.length];
                  return (
                    <div key={z.id} style={{ background: 'white', borderRadius: '16px', border: '0.5px solid #b8d4b8', overflow: 'hidden' }}>
                      <div onClick={() => !rozwinięte && setAktywneZadanie(z)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', cursor: 'pointer' }}>
                        <div style={{ width: '4px', height: '44px', background: '#6B9C68', borderRadius: '2px', flexShrink: 0 }} />
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `url(${photo}) center/cover`, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.tytul}</div>
                          <a href={odp.link_pracy} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '10px', color: 'var(--brand)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{odp.link_pracy}</a>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: odp.sprawdzona ? '#e8f5e9' : '#fff8e1', color: odp.sprawdzona ? '#2e7d32' : '#c8a84b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {odp.sprawdzona ? '✓' : '⏳'}
                          </span>
                        </div>
                      </div>
                      {rozwinięte && (
                        <>
                          <div style={{ borderTop: '0.5px solid var(--border-soft)', padding: '12px 14px' }}>
                            {odp.uwagi_prowadzacego && (
                              <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '10px', border: '0.5px solid #fef3c7', marginBottom: '10px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#c8a84b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>💬 Uwagi prowadzącego</p>
                                <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{odp.uwagi_prowadzacego}</p>
                              </div>
                            )}
                            <button onClick={() => { setLinkPracy(odp.link_pracy); setKomentarz(odp.komentarz || ''); }}
                              style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', padding: 0, marginBottom: '4px' }}>
                              Edytuj odpowiedź
                            </button>
                            <button onClick={() => { setAktywneZadanie(null); setLinkPracy(''); setKomentarz(''); }}
                              style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', padding: 0, marginLeft: '12px' }}>
                              Zamknij
                            </button>
                          </div>
                          {linkPracy && <FormPrzeslania zadanie={z} />}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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

            {ladowanie && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[1,2,3].map(i => (
      <div key={i} style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: '80px', height: '14px' }} />
          <div className="skeleton" style={{ width: '60px', height: '14px' }} />
        </div>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton" style={{ width: '140px', height: '18px' }} />
          <div className="skeleton" style={{ width: '200px', height: '12px' }} />
          <div className="skeleton" style={{ width: '160px', height: '12px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '8px 14px 14px' }}>
          <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '12px' }} />
        </div>
      </div>
    ))}
  </div>
)}
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
    const [bladWysylania, setBladWysylania] = useState('');
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
      setBladWysylania('');
      const { error } = await supabase.from('ankiety').insert([{
        ...odpowiedzi,
        grupa_id: kursant?.grupa_id,
        user_id: user.id,
      }]);
      if (!error) {
        setSukces(true);
      } else {
        setBladWysylania('Błąd zapisu: ' + error.message);
      }
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
          {bladWysylania && (
            <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffebee', borderRadius: '10px', fontSize: '12px', color: '#c62828', lineHeight: 1.6 }}>
              ⚠ {bladWysylania}
            </div>
          )}
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
          Student App
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

        {/* Film reklamowy */}
        <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
          <iframe
            width="100%" height="100%"
            src="https://www.youtube.com/embed/uFIqFFa0qrI"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
  // const TURNSTILE_SITE_KEY = '0x4AAAAAACty6p1M9mvVALXM'; // wyłączone

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
      setLadowanie(true); setBlad('');
      const { error } = await supabase.auth.signInWithPassword({ email, password: haslo });
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
      } else {
        zapiszProbe(email, true);
        onZalogowano();
      }
      setLadowanie(false);
    }

    async function resetHasla(e: React.FormEvent) {
      e.preventDefault();
      setLadowanie(true); setBlad('');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://on-arch-akademia.vercel.app',
      });
      if (error) {
        setBlad('Blad: ' + error.message);
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
  function EkranMaterialy() {
    const [materialy, setMaterialy] = useState<MaterialZakupu[]>([]);
    const [ladowanie, setLadowanie] = useState(true);
  
    useEffect(() => {
      supabase.from('materialy_zakupu').select('*').order('kolejnosc').then(({ data }) => {
        setMaterialy(data || []);
        setLadowanie(false);
      });
    }, []);
  
    return (
      <>
        <h2 className="page-title">Materiały do zakupu</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
          Tutaj znajdziesz dodatkowe materiały do nadrobienia zajęć w On-Arch. Kliknij "Kup online" aby przejść do sklepu.
        </p>
        {ladowanie && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', height: '120px' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '14px' }} />
              </div>
            ))}
          </div>
        )}
        {!ladowanie && materialy.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Brak materiałów. Biuro wkrótce doda listę.
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {materialy.map(m => (
            <div key={m.id} className="fade-in" style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
              {m.zdjecie_url
                ? <img src={m.zdjecie_url} alt={m.nazwa} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100px', background: '#f0ece7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8b8a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
              }
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#2a1f1f', marginBottom: '2px', lineHeight: 1.3 }}>{m.nazwa}</div>
                {m.opis && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px' }}>{m.opis}</div>}
                {m.cena && <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand)', marginBottom: '8px' }}>{m.cena}</div>}
                {m.link_sklepu
                  ? <a href={m.link_sklepu} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', textAlign: 'center', background: 'var(--brand)', color: 'white', borderRadius: '8px', padding: '6px', fontSize: '10px', fontWeight: 600, textDecoration: 'none' }}>
                      Kup online →
                    </a>
                  : <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '6px' }}>Brak linku</div>
                }
              </div>
            </div>
          ))}
        </div>
      </>
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
      await wyslijPush(supabase, {
        grupa_id: kursant.grupa_id,
        title: `${kursant.imie} na czacie`,
        body: nowa.trim(),
        url: '/',
      });
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
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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
    const [aktywnaZakladka, setAktywnaZakladka] = useState('home');
    const [mojeProwadzacyId, setMojeProwadzacyId] = useState<number | null>(null);
    const [mojeImieNazwisko, setMojeImieNazwisko] = useState('');
    const [mojeGrupy, setMojeGrupy] = useState<Grupa[]>([]);
    const [mojeGrupyIds, setMojeGrupyIds] = useState<number[]>([]);
    const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
    const [kursanci, setKursanci] = useState<KursantAdmin[]>([]);
    const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
    const [zadania, setZadania] = useState<Zadanie[]>([]);
    const [odpowiedziZadan, setOdpowiedziZadan] = useState<ZadanieOdpowiedz[]>([]);
    const [notatki, setNotatki] = useState<Notatka[]>([]);
    const [aktywneOgloszenie, setAktywneOgloszenie] = useState<Ogloszenie | null>(null);
    const [noweZadanie, setNoweZadanie] = useState({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: '', typ: 'zadanie', zdjecie_url: '' });
    const [wybranaGrupa, setWybranaGrupa] = useState('');
    const [aktywnaNotatkaKursant, setAktywnaNotatkaKursant] = useState<string | null>(null);
    const [trescNotatki, setTrescNotatki] = useState('');
    const [komunikat, setKomunikat] = useState('');
    const [ladowanie, setLadowanie] = useState(true);
    const [noweOglProw, setNoweOglProw] = useState({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', grupa_id: '' });
    const [edytowaneOglProw, setEdytowaneOglProw] = useState<Ogloszenie | null>(null);

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
        if (pData) setMojeImieNazwisko(`${pData.imie} ${pData.nazwisko}`);

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
      setZjazdy((zjData || []).map((z: any) => ({ ...z, status: przeliczStatus(z) })));

      // 4. Pobierz tylko swoje grupy, kursantów, zadania, ogłoszenia
      const [{ data: gr }, { data: ku }, { data: og }, { data: zad }, { data: odp }] = await Promise.all([
        supabase.from('grupy').select('*').in('id', grupyIds),
        supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny').eq('rola', 'kursant').in('grupa_id', grupyIds),
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
        zdjecie_url: noweZadanie.zdjecie_url || null,
      }]);
      if (error) { setKomunikat('Błąd: ' + error.message); return; }
      setKomunikat('Zadanie dodane!');
      setNoweZadanie({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: '', typ: 'zadanie', zdjecie_url: '' });
      const { data } = await supabase.from('zadania').select('*').in('grupa_id', mojeGrupyIds).order('created_at', { ascending: false });
      setZadania(data || []);
    }
    
    async function usunZadanie(id: number) {
      if (!window.confirm('Usunąć zadanie?')) return;
      await supabase.from('zadania').delete().eq('id', id);
      setZadania(prev => prev.filter(z => z.id !== id));
    }
    

    async function dodajOgloszenieProw(e: React.FormEvent) {
      e.preventDefault();
      if (!noweOglProw.tytul.trim() || !noweOglProw.grupa_id) return;
      const { error } = await supabase.from('ogloszenia').insert([{
        typ: noweOglProw.typ,
        tytul: noweOglProw.tytul.trim(),
        tresc: noweOglProw.tresc.trim(),
        szczegoly: noweOglProw.szczegoly.trim() || null,
        grupa_id: parseInt(noweOglProw.grupa_id),
        autor_user_id: user.id,
        nowe: true,
        data_utworzenia: new Date().toISOString(),
      }]);
      if (error) { setKomunikat('Błąd: ' + error.message); return; }
      setKomunikat('Ogłoszenie dodane!');
      setNoweOglProw({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', grupa_id: noweOglProw.grupa_id });
      const { data } = await supabase.from('ogloszenia').select('*').in('grupa_id', mojeGrupyIds).order('data_utworzenia', { ascending: false });
      setOgloszenia(data || []);
    }

    async function zapiszEdycjeOglProw(e: React.FormEvent) {
      e.preventDefault();
      if (!edytowaneOglProw) return;
      const { error } = await supabase.from('ogloszenia').update({
        typ: edytowaneOglProw.typ,
        tytul: edytowaneOglProw.tytul,
        tresc: edytowaneOglProw.tresc,
        szczegoly: edytowaneOglProw.szczegoly || null,
      }).eq('id', edytowaneOglProw.id);
      if (error) { setKomunikat('Błąd: ' + error.message); return; }
      setKomunikat('Ogłoszenie zaktualizowane!');
      setEdytowaneOglProw(null);
      const { data } = await supabase.from('ogloszenia').select('*').in('grupa_id', mojeGrupyIds).order('data_utworzenia', { ascending: false });
      setOgloszenia(data || []);
    }

    async function usunOgloszenieProw(id: string) {
      if (!window.confirm('Usunąć ogłoszenie?')) return;
      await supabase.from('ogloszenia').delete().eq('id', id);
      setOgloszenia(prev => prev.filter(o => o.id !== id));
      setKomunikat('Ogłoszenie usunięte.');
    }

    return (
      <div className="biuro-shell">
        {/* ── SIDEBAR (desktop) ── */}
        <aside className="biuro-sidebar">
        <div className="biuro-sidebar-logo">
            <OnArchLogo height={24} color="var(--brand-dark)" />
            <span className="biuro-sidebar-role">Prowadzący</span>
          </div>
          <div style={{ padding: '8px 16px 4px', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '0.5px solid var(--border)', marginBottom: '8px', paddingBottom: '12px' }}>
            {kursant?.imie} {kursant?.nazwisko}
          </div>
          <nav className="biuro-sidebar-nav">
          {[
              { id: 'home',      icon: <Home size={18}/>,        label: 'Pulpit' },
              { id: 'zadania',   icon: <BookOpen size={18}/>,    label: 'Zadania' },
              { id: 'zjazdy',    icon: <Calendar size={18}/>,    label: 'Zajęcia' },
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
            {aktywnaZakladka === 'home' && 'Pulpit'}
              {aktywnaZakladka === 'zadania' && 'Zadania'}
              {aktywnaZakladka === 'zjazdy' && 'Zajęcia'}
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
            {aktywnaZakladka === 'home' && (
              <>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Witaj z powrotem</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '32px', color: 'var(--brand-dark)', lineHeight: 1.1, marginBottom: '4px' }}>
                  {ladowanie ? 'Ładowanie...' : (mojeImieNazwisko || user.email.split('@')[0])}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {mojeGrupy.length > 0 ? `${mojeGrupy.length} ${mojeGrupy.length === 1 ? 'grupa' : 'grupy'} · ${zjazdy.filter(z => z.status === 'nadchodzacy').length} nadchodzących zajęć` : 'Panel prowadzącego On-Arch'}
                  </div>
                </div>

                <div className="biuro-kafelki">
                  {[
                    { id: 'zadania',    label: 'Zadania',    opis: `${zadania.length} zadań · ${odpowiedziZadan.length} odpowiedzi`,   icon: <BookOpen size={22}/> },
                    { id: 'zjazdy',     label: 'Zajęcia',    opis: `${zjazdy.filter(z => z.status === 'nadchodzacy').length} nadchodzących`,  icon: <Calendar size={22}/> },
                    { id: 'obecnosc',   label: 'Obecność',   opis: 'Weryfikacja list',                                                  icon: <CheckSquare size={22}/> },
                    { id: 'kursanci',   label: 'Kursanci',   opis: `${kursanci.length} osób`,                                           icon: <User size={22}/> },
                    { id: 'ogloszenia', label: 'Ogłoszenia', opis: `${ogloszenia.length} ogłoszeń`,                                     icon: <Bell size={22}/> },
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

                {zjazdy.filter(z => z.status === 'nadchodzacy').length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>Najbliższe zajęcia</div>
                    {zjazdy.filter(z => z.status === 'nadchodzacy').slice(0, 3).map(z => {
                      const g = mojeGrupy.find(gr => gr.id === z.grupa_id);
                      return (
                        <div key={z.id} onClick={() => setAktywnaZakladka('zjazdy')}
                          style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '16px', fontWeight: 500, color: 'var(--brand)' }}>{z.nr}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{z.daty}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g?.nazwa || '—'}{z.tematy ? ` · ${z.tematy}` : ''}</div>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: '#e8f5e9', color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nadchodzące</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                    <div key={o.id} style={{ padding: '10px 14px', borderBottom: oi < odp.length - 1 ? '0.5px solid var(--border-soft)' : 'none' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', minWidth: '120px' }}>{o.imie} {o.nazwisko}</span>
                                        <a href={o.link_pracy} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>→ Otwórz pracę</a>
                                        {o.komentarz && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{o.komentarz}</span>}
                                        {/* Status sprawdzenia */}
                                        <button onClick={async () => {
                                          const { error } = await supabase.from('zadania_odpowiedzi').update({ sprawdzona: !o.sprawdzona }).eq('id', o.id);
                                          if (error) { setKomunikat('Błąd: ' + error.message); return; }
                                          const { data } = await supabase.from('zadania_odpowiedzi').select('*').in('zadanie_id', zadania.map(zz => zz.id));
                                          setOdpowiedziZadan(data || []);
                                          setKomunikat(o.sprawdzona ? 'Oznaczono jako: do sprawdzenia' : 'Oznaczono jako: sprawdzona ✓');
                                        }} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                                          background: o.sprawdzona ? '#e8f5e9' : '#fff8e1',
                                          color: o.sprawdzona ? '#2e7d32' : '#c8a84b' }}>
                                          {o.sprawdzona ? '✓ Sprawdzona' : '· Do sprawdzenia'}
                                        </button>
                                      </div>
                                      {/* Uwagi prowadzącego */}
                                      <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                        <input type="text"
                                          defaultValue={o.uwagi_prowadzacego || ''}
                                          placeholder="Dodaj uwagi do pracy…"
                                          onBlur={async e => {
                                            const val = e.target.value.trim();
                                            if (val !== (o.uwagi_prowadzacego || '').trim()) {
                                              const { error } = await supabase.from('zadania_odpowiedzi').update({ uwagi_prowadzacego: val || null }).eq('id', o.id);
                                              if (error) { setKomunikat('Błąd: ' + error.message); return; }
                                              const { data } = await supabase.from('zadania_odpowiedzi').select('*').in('zadanie_id', zadania.map(zz => zz.id));
                                              setOdpowiedziZadan(data || []);
                                              setKomunikat('Uwagi zapisane');
                                            }
                                          }}
                                          style={{ flex: 1, fontSize: '11px', padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', fontFamily: 'Jost, sans-serif', background: 'white' }} />
                                      </div>
                                      {o.uwagi_prowadzacego && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>💬 {o.uwagi_prowadzacego}</div>}
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
                    <KalendarzZjazdow zjazdy={zjazdy} grupy={mojeGrupy} />
                    {zjazdy.map(z => {
                      const grupa = mojeGrupy.find(g => g.id === z.grupa_id);
                      return (
                      <div key={z.id} className="profil-card" style={{ marginBottom: '8px' }}>
                        <div className="profil-row">
                          <span className="profil-lbl" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px' }}>Zjazd {z.nr} — {z.daty}</span>
                          <span className={`s-badge s-${z.status}`}>{z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}</span>
                        </div>
                        <div className="profil-row"><span className="profil-lbl">Grupa</span><span className="profil-val">{grupa?.nazwa || '-'}</span></div>
                        {z.typ === 'online' ? (
                          <div className="profil-row"><span className="profil-lbl">🌐 Online</span>{z.link_online && <a href={z.link_online} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand)' }}>Dołącz →</a>}</div>
                        ) : (
                          z.sala && <div className="profil-row"><span className="profil-lbl">Sala</span><span className="profil-val">{z.sala}</span></div>
                        )}
                        {/* Sekcja przygotowania — tylko dla grup PWO/POO */}
                        {grupa && czyOdwroconaKlasa(grupa.nazwa) && (
                          <div style={{ padding: '0 14px 12px' }}>
                            <SekcjaPrzygotowania zjazd={z} user={user} czyProwadzacy={true} />
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </>
                )}
                {aktywnaZakladka === 'ogloszenia' && (
                  <>
                    {aktywneOgloszenie && !edytowaneOglProw ? (
                      <EkranSzczegoly o={aktywneOgloszenie} onWroc={() => setAktywneOgloszenie(null)} />
                    ) : (
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {/* Formularz — nowe lub edycja */}
                        <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', minWidth: '260px', flex: '1' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
                            {edytowaneOglProw ? 'Edytuj ogłoszenie' : 'Nowe ogłoszenie'}
                          </div>
                          <form onSubmit={edytowaneOglProw ? zapiszEdycjeOglProw : dodajOgloszenieProw}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <select value={edytowaneOglProw ? edytowaneOglProw.typ : noweOglProw.typ}
                                onChange={e => edytowaneOglProw ? setEdytowaneOglProw({ ...edytowaneOglProw, typ: e.target.value }) : setNoweOglProw(v => ({ ...v, typ: e.target.value }))}
                                style={{ flex: 1, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                                <option>Informacja</option><option>Pilne</option><option>Zmiana</option>
                              </select>
                              {!edytowaneOglProw && (
                                <select value={noweOglProw.grupa_id} onChange={e => setNoweOglProw(v => ({ ...v, grupa_id: e.target.value }))} required
                                  style={{ flex: 2, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                                  <option value="">Wybierz grupę *</option>
                                  {mojeGrupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                                </select>
                              )}
                            </div>
                            <input type="text"
                              value={edytowaneOglProw ? edytowaneOglProw.tytul : noweOglProw.tytul}
                              onChange={e => edytowaneOglProw ? setEdytowaneOglProw({ ...edytowaneOglProw, tytul: e.target.value }) : setNoweOglProw(v => ({ ...v, tytul: e.target.value }))}
                              placeholder="Tytuł *" required
                              style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                            <input type="text"
                              value={edytowaneOglProw ? edytowaneOglProw.tresc : noweOglProw.tresc}
                              onChange={e => edytowaneOglProw ? setEdytowaneOglProw({ ...edytowaneOglProw, tresc: e.target.value }) : setNoweOglProw(v => ({ ...v, tresc: e.target.value }))}
                              placeholder="Krótki opis *" required
                              style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                            <textarea
                              value={edytowaneOglProw ? (edytowaneOglProw.szczegoly || '') : noweOglProw.szczegoly}
                              onChange={e => edytowaneOglProw ? setEdytowaneOglProw({ ...edytowaneOglProw, szczegoly: e.target.value }) : setNoweOglProw(v => ({ ...v, szczegoly: e.target.value }))}
                              placeholder="Pełna treść (opcjonalnie)" rows={3}
                              style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '4px' }} />
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>💡 Linki wklejone w treści będą automatycznie klikalne</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="submit" style={{ flex: 1, padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                                {edytowaneOglProw ? 'Zapisz zmiany' : '+ Dodaj ogłoszenie'}
                              </button>
                              {edytowaneOglProw && (
                                <button type="button" onClick={() => setEdytowaneOglProw(null)}
                                  style={{ padding: '8px 14px', background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>
                                  Anuluj
                                </button>
                              )}
                            </div>
                          </form>
                        </div>
                        {/* Lista ogłoszeń */}
                        <div style={{ flex: '2', minWidth: '260px' }}>
                          {ogloszenia.length === 0
                            ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Brak ogłoszeń</div>
                            : ogloszenia.map(o => (
                              <div key={o.id} style={{ position: 'relative' }}>
                                <KartaOgloszenia o={o} onClick={() => { setAktywneOgloszenie(o); setEdytowaneOglProw(null); }} />
                                {(o.autor_user_id === user.id || (!o.autor_user_id && o.grupa_id && mojeGrupyIds.includes(Number(o.grupa_id)))) && (
                                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
                                    <button onClick={e => { e.stopPropagation(); setEdytowaneOglProw(o); setAktywneOgloszenie(null); }}
                                      style={{ fontSize: '11px', padding: '2px 10px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>
                                      Edytuj
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); usunOgloszenieProw(o.id); }}
                                      style={{ fontSize: '11px', padding: '2px 8px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#e57373' }}>
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </div>
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
          <button className={`nav-item ${aktywnaZakladka === 'home' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('home')}><Home size={20} /><span className="nav-label">Pulpit</span></button>
            <button className={`nav-item ${aktywnaZakladka === 'zadania' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('zadania')}><BookOpen size={20} /><span className="nav-label">Zadania</span></button>
            <button className={`nav-item ${aktywnaZakladka === 'zjazdy' ? 'active' : ''}`} onClick={() => setAktywnaZakladka('zjazdy')}><Calendar size={20} /><span className="nav-label">Zajęcia</span></button>
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
    zjazdy: Zjazd[]; grupy: Grupa[]; kursanci: KursantAdmin[]; prowadzacyUserId: string;
  }) {
    const [wybranyZjazd, setWybranyZjazd] = useState('');
    const [obecnosci, setObecnosci] = useState<Obecnosc[]>([]);
    const [ladowanie, setLadowanie] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);
    const [pozneGodziny, setPozneGodziny] = useState<Record<string, { przybycie: string; wyjscie: string }>>({});
    const [aktywneGodziny, setAktywneGodziny] = useState<string | null>(null);
  
    const zjazd = zjazdy.find(z => z.id === parseInt(wybranyZjazd));
    const kursanciZjazdu = zjazd ? kursanci.filter(k => k.grupa_id === zjazd.grupa_id).sort((a, b) => a.nazwisko.localeCompare(b.nazwisko)) : [];
    const maDzien2 = !!zjazd?.data_dzien2;
  
    useEffect(() => {
      if (!wybranyZjazd) { setObecnosci([]); return; }
      setLadowanie(true);
      supabase.from('obecnosci').select('*').eq('zjazd_id', parseInt(wybranyZjazd))
        .then(({ data }) => { setObecnosci(data || []); setLadowanie(false); });
    }, [wybranyZjazd]);
  
    const pobierzWpis = (userId: string, dzien: 1 | 2) =>
      obecnosci.find(o => o.user_id === userId && o.dzien === dzien);
  
    async function ustawStatus(k: KursantAdmin, dzien: 1 | 2, nowyStatus: 'potwierdzono' | 'nieobecnosc' | 'spozniony') {
      if (!zjazd) return;
      const key = `${k.user_id}_${dzien}`;
      setSaving(key);
      const existing = pobierzWpis(k.user_id, dzien);
      const godz = pozneGodziny[key] || { przybycie: '', wyjscie: '' };
  
      if (existing && existing.status === nowyStatus) {
        await supabase.from('obecnosci').delete().eq('id', existing.id);
        setObecnosci(prev => prev.filter(o => o.id !== existing.id));
      } else if (existing) {
        const updateData: any = { status: nowyStatus === 'spozniony' ? 'potwierdzono' : nowyStatus, zweryfikowano: true, zweryfikowano_przez: prowadzacyUserId };
        if (nowyStatus === 'spozniony') { updateData.godzina_przybycia = godz.przybycie || null; updateData.godzina_wyjscia = godz.wyjscie || null; }
        else { updateData.godzina_przybycia = null; updateData.godzina_wyjscia = null; }
        await supabase.from('obecnosci').update(updateData).eq('id', existing.id);
        setObecnosci(prev => prev.map(o => o.id === existing.id ? { ...o, ...updateData } : o));
      } else {
        const insertData: any = {
          zjazd_id: zjazd.id, user_id: k.user_id, grupa_id: zjazd.grupa_id,
          imie: k.imie, nazwisko: k.nazwisko, dzien,
          status: nowyStatus === 'spozniony' ? 'potwierdzono' : nowyStatus,
          zweryfikowano: true, zweryfikowano_przez: prowadzacyUserId,
          godzina_przybycia: nowyStatus === 'spozniony' ? (godz.przybycie || null) : null,
          godzina_wyjscia: nowyStatus === 'spozniony' ? (godz.wyjscie || null) : null,
        };
        const { data: nowy } = await supabase.from('obecnosci').insert([insertData]).select().single();
        if (nowy) setObecnosci(prev => [...prev, nowy as Obecnosc]);
      }
      setSaving(null);
    }
  
    function getStatusKursanta(userId: string, dzien: 1 | 2): 'potwierdzono' | 'nieobecnosc' | 'spozniony' | null {
      const wpis = pobierzWpis(userId, dzien);
      if (!wpis) return null;
      if (wpis.status === 'potwierdzono' && (wpis.godzina_przybycia || wpis.godzina_wyjscia)) return 'spozniony';
      return wpis.status as any;
    }
  
    const stats = (dzien: 1 | 2) => {
      const obecni = obecnosci.filter(o => o.dzien === dzien && o.status === 'potwierdzono').length;
      const nieobecni = obecnosci.filter(o => o.dzien === dzien && o.status === 'nieobecnosc').length;
      return { obecni, nieobecni, brak: kursanciZjazdu.length - obecni - nieobecni };
    };
  
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="page-title" style={{ margin: 0 }}>Weryfikacja obecności</h2>
          <select value={wybranyZjazd} onChange={e => setWybranyZjazd(e.target.value)}
            style={{ fontSize: '13px', padding: '8px 14px', border: '0.5px solid var(--border)', borderRadius: '10px', fontFamily: 'Jost, sans-serif', background: 'white', minWidth: '220px' }}>
            <option value="">Wybierz zjazd…</option>
            {zjazdy.map(z => {
              const g = grupy.find(gr => gr.id === z.grupa_id);
              return <option key={z.id} value={z.id}>Zjazd {z.nr} · {z.daty} {g ? `(${g.nazwa})` : ''}</option>;
            })}
          </select>
        </div>
  
        {!wybranyZjazd && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '18px' }}>
            Wybierz zjazd aby zobaczyć listę kursantów
          </div>
        )}
  
        {wybranyZjazd && zjazd && (
          <>
            {/* Info o zjeździe */}
            <div style={{ background: 'var(--brand-light)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div><span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Zjazd</span><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand-dark)' }}>{zjazd.nr} · {zjazd.daty}</div></div>
              {zjazd.data_dzien1 && <div><span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>D1</span><div style={{ fontSize: '13px', color: 'var(--text)' }}>{new Date(zjazd.data_dzien1).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}{zjazd.godzina_start_d1 ? ` · ${zjazd.godzina_start_d1}–${zjazd.godzina_end_d1}` : ''}</div></div>}
              {zjazd.data_dzien2 && <div><span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>D2</span><div style={{ fontSize: '13px', color: 'var(--text)' }}>{new Date(zjazd.data_dzien2).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}{zjazd.godzina_start_d2 ? ` · ${zjazd.godzina_start_d2}–${zjazd.godzina_end_d2}` : ''}</div></div>}
            </div>
  
            {/* Statystyki */}
            {!ladowanie && kursanciZjazdu.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[1, maDzien2 ? 2 : null].filter(Boolean).map(d => {
                  const s = stats(d as 1 | 2);
                  return (
                    <div key={d} style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '8px 14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>D{d}</span>
                      <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>✓ {s.obecni}</span>
                      <span style={{ fontSize: '12px', color: '#c62828', fontWeight: 600 }}>✗ {s.nieobecni}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— {s.brak}</span>
                    </div>
                  );
                })}
              </div>
            )}
  
            {ladowanie && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Ładowanie...</div>}
  
            {!ladowanie && kursanciZjazdu.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>Brak kursantów w tej grupie.</div>
            )}
  
            {!ladowanie && kursanciZjazdu.length > 0 && (
              <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                {/* Nagłówek tabeli */}
                <div style={{ display: 'grid', gridTemplateColumns: maDzien2 ? '1fr 280px 280px' : '1fr 280px', gap: 0, background: 'var(--bg)', borderBottom: '0.5px solid var(--border)', padding: '10px 16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Kursant</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>
                    Dzień 1 {zjazd.data_dzien1 ? `· ${new Date(zjazd.data_dzien1).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}` : ''}
                  </div>
                  {maDzien2 && <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>
                    Dzień 2 {zjazd.data_dzien2 ? `· ${new Date(zjazd.data_dzien2).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}` : ''}
                  </div>}
                </div>
  
                {/* Wiersze kursantów */}
                {kursanciZjazdu.map((k, idx) => (
                  <div key={k.id} style={{ borderBottom: idx < kursanciZjazdu.length - 1 ? '0.5px solid var(--border-soft)' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: maDzien2 ? '1fr 280px 280px' : '1fr 280px', gap: 0, padding: '12px 16px', alignItems: 'center', background: idx % 2 === 0 ? 'white' : '#fdfcfb' }}>
                      {/* Imię */}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{k.imie} {k.nazwisko}</div>
                        {k.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.email}</div>}
                      </div>
  
                      {/* D1 */}
                      {([1, maDzien2 ? 2 : null].filter(Boolean) as (1|2)[]).map(dzien => {
                        const key = `${k.user_id}_${dzien}`;
                        const status = getStatusKursanta(k.user_id, dzien);
                        const isSaving = saving === key;
                        const wpis = pobierzWpis(k.user_id, dzien);
  
                        return (
                          <div key={dzien} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {/* Obecny */}
                              <button onClick={() => ustawStatus(k, dzien, 'potwierdzono')} disabled={isSaving}
                                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: isSaving ? 'default' : 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                                  background: status === 'potwierdzono' ? '#2e7d32' : '#f0faf4',
                                  color: status === 'potwierdzono' ? 'white' : '#2e7d32',
                                  opacity: isSaving ? 0.6 : 1,
                                }}>
                                {isSaving && status !== 'potwierdzono' ? '…' : '✓ Obecny'}
                              </button>
                              {/* Nieobecny */}
                              <button onClick={() => ustawStatus(k, dzien, 'nieobecnosc')} disabled={isSaving}
                                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: isSaving ? 'default' : 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                                  background: status === 'nieobecnosc' ? '#c62828' : '#fff5f5',
                                  color: status === 'nieobecnosc' ? 'white' : '#c62828',
                                  opacity: isSaving ? 0.6 : 1,
                                }}>
                                {isSaving && status !== 'nieobecnosc' ? '…' : '✗ Nieobecny'}
                              </button>
                              {/* Spóźniony */}
                              <button onClick={() => { ustawStatus(k, dzien, 'spozniony'); setAktywneGodziny(aktywneGodziny === key ? null : key); }} disabled={isSaving}
                                style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: isSaving ? 'default' : 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                                  background: status === 'spozniony' ? '#e65100' : '#fff8f0',
                                  color: status === 'spozniony' ? 'white' : '#e65100',
                                  opacity: isSaving ? 0.6 : 1,
                                }}>
                                ⏰
                              </button>
                            </div>
  
                            {/* Godziny spóźnienia */}
                            {(aktywneGodziny === key || status === 'spozniony') && (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input type="time" placeholder="przybycie"
                                  defaultValue={wpis?.godzina_przybycia || ''}
                                  onChange={e => setPozneGodziny(prev => ({ ...prev, [key]: { ...prev[key], przybycie: e.target.value } }))}
                                  style={{ fontSize: '11px', padding: '4px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', width: '100px' }} />
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>–</span>
                                <input type="time" placeholder="wyjście"
                                  defaultValue={wpis?.godzina_wyjscia || ''}
                                  onChange={e => setPozneGodziny(prev => ({ ...prev, [key]: { ...prev[key], wyjscie: e.target.value } }))}
                                  style={{ fontSize: '11px', padding: '4px 8px', border: '0.5px solid var(--border)', borderRadius: '7px', width: '100px' }} />
                              </div>
                            )}
  
                            {/* Powód nieobecności */}
                            {status === 'nieobecnosc' && wpis?.powod_nieobecnosci && (
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{wpis.powod_nieobecnosci}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  // ─── BACKUP ──────────────────────────────────────────────────────────────────

  function EkranBackup({ onBackupDone }: { onBackupDone?: () => void }) {
    const SUPABASE_URL = 'https://bksebyxrknubyokwuaby.supabase.co';
    const TABLES = [
      'kursanci', 'grupy', 'zjazdy', 'ogloszenia', 'obecnosci',
      'zadania', 'zadania_odpowiedzi', 'wiadomosci', 'ankiety',
      'prowadzacy', 'zjazdy_prowadzacy', 'notatki_kursantow',
      'materialy_zjazdu', 'pytania_przed_zjazdem'
    ];
    const [serviceKey, setServiceKey] = useState('');
    const [statusy, setStatusy] = useState<Record<string, 'idle'|'loading'|'ok'|'error'>>({});
    const [postep, setPostep] = useState(0);
    const [info, setInfo] = useState('');
    const [laduje, setLaduje] = useState(false);

    function toCSV(rows: any[]) {
      if (!rows || rows.length === 0) return '';
      const headers = Object.keys(rows[0]);
      const escape = (v: any) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return (s.includes(',') || s.includes('"') || s.includes('\n'))
          ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      return [headers.join(','), ...rows.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
    }

    async function startBackup() {
      if (!serviceKey.trim()) { setInfo('⚠ Wklej klucz service_role z Supabase → Settings → API'); return; }
      setLaduje(true);
      setPostep(0);
      setInfo('Pobieranie danych...');
      setStatusy({});

      const csvFiles: Record<string, string> = {};
      let done = 0;

      for (const table of TABLES) {
        setStatusy(prev => ({ ...prev, [table]: 'loading' }));
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
            headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const rows = await res.json();
          csvFiles[table] = toCSV(rows);
          setStatusy(prev => ({ ...prev, [table]: 'ok' }));
        } catch(e: any) {
          setStatusy(prev => ({ ...prev, [table]: 'error' }));
        }
        done++;
        setPostep(Math.round(done / TABLES.length * 100));
      }

      // Załaduj JSZip dynamicznie
      setInfo('Pakowanie plików...');
      await new Promise<void>((resolve, reject) => {
        if ((window as any).JSZip) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Nie udało się załadować JSZip'));
        document.head.appendChild(script);
      });

      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      const date = new Date().toISOString().split('T')[0];
      const folder = zip.folder(`onarch-backup-${date}`);

      let pobranych = 0;
      for (const [table, csv] of Object.entries(csvFiles)) {
        folder.file(`${table}.csv`, '\uFEFF' + csv);
        pobranych++;
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onarch-backup-${date}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      const bledow = TABLES.length - pobranych;
      if (bledow === 0 || pobranych > 0) {
        localStorage.setItem('onarch_backup_date', new Date().toISOString());
        if (onBackupDone) onBackupDone();
      }
      setInfo(bledow === 0
        ? `✓ Backup gotowy! Pobrano ${pobranych} tabel → onarch-backup-${date}.zip`
        : pobranych === 0
          ? `✕ Błąd — nie pobrano żadnych danych. Sprawdź czy wpisałaś klucz service_role.`
          : `⚠ Backup częściowy — pobrano ${pobranych}, błędy: ${bledow} tabel.`);
      setLaduje(false);
    }

    const kolorStatusu = (s: string) => s === 'ok' ? '#4caf50' : s === 'error' ? '#f44336' : s === 'loading' ? '#ff9800' : '#ddd';

    return (
      <div style={{ maxWidth: '600px' }}>
        <div style={{ background: '#fffbeb', border: '0.5px solid #fde68a', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#92400e', lineHeight: 1.6 }}>
          💡 Użyj klucza <strong>service_role</strong> (Supabase → Settings → API → service_role → Reveal). Klucz nie jest zapisywany — wklejasz go tylko na czas backupu.
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            Klucz service_role
          </label>
          <input type="password" value={serviceKey} onChange={e => setServiceKey(e.target.value)}
            placeholder="eyJ..."
            style={{ width: '100%', padding: '10px 14px', border: '0.5px solid var(--border)', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }} />
        </div>

        {/* Grid tabel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px' }}>
          {TABLES.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', background: 'white', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: kolorStatusu(statusy[t] || 'idle'), flexShrink: 0, transition: 'background 0.3s' }} />
              {t}
            </div>
          ))}
        </div>

        {/* Pasek postępu */}
        {laduje && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ background: '#f0ebe8', borderRadius: '20px', height: '6px', overflow: 'hidden', marginBottom: '6px' }}>
              <div style={{ height: '100%', background: 'var(--brand)', borderRadius: '20px', width: postep + '%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>{postep}%</div>
          </div>
        )}

        <button onClick={startBackup} disabled={laduje}
          style={{ width: '100%', padding: '12px', background: laduje ? '#ccc' : 'var(--brand)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: laduje ? 'default' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
          {laduje ? 'Pobieranie...' : '⬇ Pobierz backup wszystkich tabel'}
        </button>

        {info && (
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
            background: info.startsWith('✓') ? '#e8f5e9' : '#fffbeb',
            color: info.startsWith('✓') ? '#2e7d32' : '#92400e' }}>
            {info}
          </div>
        )}
      </div>
    );
  }
  function GaleriaZdjec({ onWybierz, onZamknij }: { onWybierz: (url: string) => void; onZamknij: () => void }) {
    const [zdjecia, setZdjecia] = useState<ZdjecieAplikacji[]>([]);
    const [filtrTag, setFiltrTag] = useState('');
    const [ladowanie, setLadowanie] = useState(true);

    useEffect(() => {
      supabase.from('zdjecia_aplikacji').select('*').order('tag').order('kolejnosc')
        .then(({ data }) => { setZdjecia(data || []); setLadowanie(false); });
    }, []);

    const tagi = [...new Set(zdjecia.map(z => z.tag).filter((t): t is string => !!t))];
    const lista = filtrTag ? zdjecia.filter(z => z.tag === filtrTag) : zdjecia;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        onClick={onZamknij}>
        <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          onClick={e => e.stopPropagation()}>
          <div style={{ padding: '18px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>Wybierz zdjęcie</div>
            <button onClick={onZamknij} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
          </div>
          <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setFiltrTag('')}
              style={{ padding: '5px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: 'Jost, sans-serif', background: !filtrTag ? 'var(--brand-dark)' : '#f0ece7', color: !filtrTag ? 'white' : 'var(--text-muted)' }}>
              Wszystkie
            </button>
            {tagi.map(tag => (
              <button key={tag} onClick={() => setFiltrTag(tag)}
                style={{ padding: '5px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: 'Jost, sans-serif', background: filtrTag === tag ? 'var(--brand-dark)' : '#f0ece7', color: filtrTag === tag ? 'white' : 'var(--text-muted)' }}>
                {tag}
              </button>
            ))}
          </div>
          <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
            {ladowanie && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Ładowanie...</div>}
            {!ladowanie && lista.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Brak zdjęć{filtrTag ? ` z tagiem "${filtrTag}"` : ''} — wgraj je w zakładce Zdjęcia.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {lista.map(z => (
                <div key={z.id} onClick={() => { onWybierz(z.url); onZamknij(); }}
                  style={{ borderRadius: '12px', overflow: 'hidden', border: '0.5px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  <img src={z.url} alt={z.nazwa} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '6px 8px', background: 'white' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.nazwa || '—'}</div>
                    {z.tag && <div style={{ fontSize: '9px', color: 'var(--brand)', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{z.tag}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  function AdminZdjecia() {
    const [zdjecia, setZdjecia] = useState<ZdjecieAplikacji[]>([]);
    const [uploading, setUploading] = useState(false);
    const [kategoria, setKategoria] = useState<string>('hero');
  const [tag, setTag] = useState('');
    const [komunikat, setKomunikat] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
  
    const KATEGORIE = [
      { id: 'hero', label: 'Ekran główny — tło zjazdu', opis: 'Jedno zdjęcie, widoczne w ciemnej karcie zjazdu' },
      { id: 'zjazdy', label: 'Karty zjazdów', opis: 'Zdjęcia cyklicznie przypisywane do kart zjazdów' },
      { id: 'zadania', label: 'Miniatury zadań', opis: 'Zdjęcia cyklicznie przypisywane do zadań' },
      { id: 'strefa_wiedzy', label: 'Strefa Wiedzy', opis: 'Karty w sekcji materiałów na ekranie głównym' },
    ];
  
    useEffect(() => { pobierz(); }, []);
  
    async function pobierz() {
      const { data } = await supabase.from('zdjecia_aplikacji').select('*').order('kategoria').order('kolejnosc');
      setZdjecia(data || []);
    }
  
    async function wgrajZdjecie(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setKomunikat('');
      const ext = file.name.split('.').pop();
      const path = `${kategoria}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('app-images').upload(path, file, { upsert: false });
      if (uploadError) { setKomunikat('Błąd uploadu: ' + uploadError.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('app-images').getPublicUrl(path);
      const { error: dbError } = await supabase.from('zdjecia_aplikacji').insert([{
        kategoria, url: urlData.publicUrl, nazwa: file.name.split('.')[0], kolejnosc: zdjecia.filter(z => z.kategoria === kategoria).length, tag: tag.trim() || null,
      }]);
      if (dbError) { setKomunikat('Błąd zapisu: ' + dbError.message); } else { setKomunikat('Zdjęcie dodane!'); pobierz(); }
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  
    async function usun(z: ZdjecieAplikacji) {
      if (!window.confirm(`Usunąć "${z.nazwa}"?`)) return;
      const pathMatch = z.url.match(/app-images\/(.+)$/);
      if (pathMatch) await supabase.storage.from('app-images').remove([pathMatch[1]]);
      await supabase.from('zdjecia_aplikacji').delete().eq('id', z.id);
      pobierz();
    }
  
    const zdjeciaPorKat = (kat: string) => zdjecia.filter(z => z.kategoria === kat);
  
    return (
      <>
        <h2 className="page-title">Zdjęcia aplikacji</h2>
        {komunikat && <div className="login-error" style={{ background: '#e8f5e9', color: '#2e7d32', marginBottom: '12px' }}>{komunikat}</div>}
  
        {/* Upload */}
        <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Dodaj nowe zdjęcie</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {KATEGORIE.map(k => (
              <button key={k.id} onClick={() => setKategoria(k.id)}
                style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '12px', fontWeight: 600,
                  background: kategoria === k.id ? 'var(--brand)' : 'var(--bg)', color: kategoria === k.id ? 'white' : 'var(--text-muted)' }}>
                {k.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
            {KATEGORIE.find(k => k.id === kategoria)?.opis}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Tag tematyczny (opcjonalnie)</label>
          <input type="text" value={tag} onChange={e => setTag(e.target.value)}
            placeholder="np. teoria, rysunek, sketchup, autocad, ogrody"
            style={{ width: '100%', fontSize: '13px', padding: '8px 12px', border: '0.5px solid var(--border)', borderRadius: '9px', fontFamily: 'Jost, sans-serif' }} />
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Tagi pozwalają przypisywać zdjęcia do konkretnych tematów zajęć</div>
        </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={wgrajZdjecie} disabled={uploading} style={{ fontSize: '13px', flex: 1 }} />
            {uploading && <div style={{ fontSize: '12px', color: 'var(--brand)' }}>Wysyłanie...</div>}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>Zalecane formaty: JPG, WebP. Rozmiar max 5 MB. Proporcje: poziome (16:9 lub 4:3).</div>
        </div>
  
        {/* Lista per kategoria */}
        {KATEGORIE.map(kat => {
          const lista = zdjeciaPorKat(kat.id);
          if (lista.length === 0) return null;
          return (
            <div key={kat.id} style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '10px' }}>
                {kat.label} ({lista.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {lista.map((z, idx) => (
                  <div key={z.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '0.5px solid var(--border)', background: 'white' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={z.url} alt={z.nazwa} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', letterSpacing: '0.1em' }}>
                        #{idx + 1}
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{z.nazwa || '—'}</span>
                      <button onClick={() => usun(z)} style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px', padding: '0 2px', flexShrink: 0 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
  
        {zdjecia.length === 0 && !uploading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>Brak wgranych zdjęć. Użyj formularza powyżej aby dodać pierwsze.</div>
        )}
      </>
    );
  }
  function AdminMaterialy() {
    const [materialy, setMaterialy] = useState<MaterialZakupu[]>([]);
    const [nowy, setNowy] = useState({ nazwa: '', opis: '', cena: '', zdjecie_url: '', link_sklepu: '' });
    const [komunikat, setKomunikat] = useState('');
  
    useEffect(() => { pobierz(); }, []);
  
    async function pobierz() {
      const { data } = await supabase.from('materialy_zakupu').select('*').order('kolejnosc');
      setMaterialy(data || []);
    }
  
    async function dodaj(e: React.FormEvent) {
      e.preventDefault();
      const { error } = await supabase.from('materialy_zakupu').insert([{
        nazwa: nowy.nazwa,
        opis: nowy.opis || null,
        cena: nowy.cena || null,
        zdjecie_url: nowy.zdjecie_url || null,
        link_sklepu: nowy.link_sklepu || null,
        kolejnosc: materialy.length,
      }]);
      if (error) { setKomunikat('Błąd: ' + error.message); return; }
      setKomunikat('Dodano!');
      setNowy({ nazwa: '', opis: '', cena: '', zdjecie_url: '', link_sklepu: '' });
      pobierz();
    }
  
    async function usun(id: string) {
      if (!window.confirm('Usunąć produkt?')) return;
      await supabase.from('materialy_zakupu').delete().eq('id', id);
      pobierz();
    }
  
    return (
      <>
        <h2 className="page-title">Materiały do zakupu</h2>
        {komunikat && <div className="login-error" style={{ background: '#e8f5e9', color: '#2e7d32', marginBottom: '12px' }}>{komunikat}</div>}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', minWidth: '280px', flex: '1' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Dodaj produkt</div>
            <form onSubmit={dodaj}>
              <input type="text" value={nowy.nazwa} onChange={e => setNowy({ ...nowy, nazwa: e.target.value })} placeholder="Nazwa produktu *" required
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
              <input type="text" value={nowy.opis} onChange={e => setNowy({ ...nowy, opis: e.target.value })} placeholder="Opis (opcjonalnie)"
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
              <input type="text" value={nowy.cena} onChange={e => setNowy({ ...nowy, cena: e.target.value })} placeholder="Cena np. ok. 25 zł"
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
              <input type="url" value={nowy.zdjecie_url} onChange={e => setNowy({ ...nowy, zdjecie_url: e.target.value })} placeholder="Link do zdjęcia (opcjonalnie)"
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
              <input type="url" value={nowy.link_sklepu} onChange={e => setNowy({ ...nowy, link_sklepu: e.target.value })} placeholder="Link do sklepu (opcjonalnie)"
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
              <button type="submit" style={{ width: '100%', padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                + Dodaj produkt
              </button>
            </form>
          </div>
          <div style={{ flex: '2', minWidth: '300px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Lista produktów ({materialy.length})</div>
            {materialy.map((m, idx) => (
              <div key={m.id} style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', padding: '12px 14px', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                {m.zdjecie_url
                  ? <img src={m.zdjecie_url} alt={m.nazwa} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f0ece7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8b8a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{m.nazwa}</div>
                  {m.opis && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.opis}</div>}
                  {m.cena && <div style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>{m.cena}</div>}
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={async () => {
                    if (idx === 0) return;
                    await supabase.from('materialy_zakupu').update({ kolejnosc: idx - 1 }).eq('id', m.id);
                    await supabase.from('materialy_zakupu').update({ kolejnosc: idx }).eq('id', materialy[idx - 1].id);
                    pobierz();
                  }} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}>↑</button>
                  <button onClick={async () => {
                    if (idx === materialy.length - 1) return;
                    await supabase.from('materialy_zakupu').update({ kolejnosc: idx + 1 }).eq('id', m.id);
                    await supabase.from('materialy_zakupu').update({ kolejnosc: idx }).eq('id', materialy[idx + 1].id);
                    pobierz();
                  }} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}>↓</button>
                  <button onClick={() => usun(m.id)} style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
                </div>
              </div>
            ))}
            {materialy.length === 0 && <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Brak produktów</div>}
          </div>
        </div>
      </>
    );
  }
  function PanelBiura({ onWyloguj, user }: { onWyloguj: () => void; user: User | null }) {
    const [aktywnaZakladka, setAktywnaZakladka] = useState('home');
    const [grupy, setGrupy] = useState<Grupa[]>([]);
    const [kursanci, setKursanci] = useState<KursantAdmin[]>([]);
    const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
    const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
    const [pokazFormGrupy, setPokazFormGrupy] = useState(false);
    const [prowadzacy, setProwadzacy] = useState<Prowadzacy[]>([]);
    const [ankiety, setAnkiety] = useState<OdpowiedziAnkiety[]>([]);
    const [zadania, setZadania] = useState<Zadanie[]>([]);
    const [odpowiedziZadan, setOdpowiedziZadan] = useState<ZadanieOdpowiedz[]>([]);
    const [edytowane, setEdytowane] = useState<Ogloszenie | null>(null);
    const [edytowanyZjazd, setEdytowanyZjazd] = useState<Zjazd | null>(null);
    const [pokazGalerieZjazd, setPokazGalerieZjazd] = useState(false);
    const [pokazGalerieZadanie, setPokazGalerieZadanie] = useState(false);
  
    const [noweOgl, setNoweOgl] = useState({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true, grupa_id: '' });
    const [nowyZjazd, setNowyZjazd] = useState({ nr: '', daty: '', sala: '', adres: '', tematy: '', status: 'nadchodzacy', typ: 'stacjonarny', link_online: '', data_zjazdu: '', data_dzien1: '', data_dzien2: '', grupa_id: '', prowadzacy_id: '' });

    // Czy backup jest wymagany (piątek >= 14:00 i nie zrobiony w tym tygodniu)
    function czyBackupWymagany(): boolean {
      const ostatni = localStorage.getItem('onarch_backup_date');
      const teraz = new Date();
      const dzienTygodnia = teraz.getDay(); // 5 = piątek
      const godzina = teraz.getHours();
      if (dzienTygodnia !== 5 || godzina < 14) return false;
      if (!ostatni) return true;
      // Sprawdź czy ostatni backup był w tym tygodniu (od poniedziałku)
      const poniedzialek = new Date(teraz);
      poniedzialek.setDate(teraz.getDate() - ((dzienTygodnia as number) === 0 ? 6 : (dzienTygodnia as number) - 1));
      poniedzialek.setHours(0, 0, 0, 0);
      return new Date(ostatni) < poniedzialek;
    }

    const [pokazBackupAlert, setPokazBackupAlert] = useState(czyBackupWymagany);

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
    const [zwinieteZjazdy, setZwinieteZjazdy] = useState<Set<number>>(new Set());
    const [zwinieteZadania, setZwinieteZadania] = useState<Set<number>>(new Set());
    const [edytowanyKursant, setEdytowanyKursant] = useState<{ id: number; imie: string; nazwisko: string; email: string; telefon: string } | null>(null);
    const [szukajKursant, setSzukajKursant] = useState('');
    const [filtrGrupaKursant, setFiltrGrupaKursant] = useState('');
    const [rozwinietaKursant, setRozwinietaKursant] = useState<number | null>(null);
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
    const [nowyProwadzacy, setNowyProwadzacy] = useState({ imie: '', nazwisko: '', bio: '', avatar_url: '', email: '', telefon: '', notatki: '', miasto: '', user_id: '' });
    const [edytowaneZadanie, setEdytowaneZadanie] = useState<Zadanie | null>(null);
    const [noweZadanie, setNoweZadanie] = useState({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: '', typ: 'zadanie', zdjecie_url: '' });
    const [komunikat, setKomunikat] = useState('');
    const [wysylanieZaproszenia, setWysylanieZaproszenia] = useState<number | null>(null);
    const [importStatus, setImportStatus] = useState<{ imie: string; nazwisko: string; email: string; status: string }[]>([]);
    const [importowanie, setImportowanie] = useState(false);
    const [wybranaGrupaAnkiety, setWybranaGrupaAnkiety] = useState('');
    const [wybranaGrupaZadan, setWybranaGrupaZadan] = useState('');
    const [wybranaGrupaDetail, setWybranaGrupaDetail] = useState<number | null>(null);
    const [zakladkaGrupy, setZakladkaGrupy] = useState<'kursanci' | 'zjazdy' | 'ogloszenia' | 'ustawienia'>('kursanci');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      pobierzGrupy(); pobierzOgloszenia(); pobierzZjazdy(); pobierzProwadzacy(); pobierzZadania();
      supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny').then(({ data }) => setKursanci((data || []) as unknown as KursantAdmin[]));
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
      setZjazdy(zjData.map((z: any) => ({ ...z, status: przeliczStatus(z), prowadzacy: map[z.id] || [] })));
    }
    async function pobierzProwadzacy() { const { data } = await supabase.from('prowadzacy').select('*').order('nazwisko', { ascending: true }); setProwadzacy(data || []); }

    async function dodajOgloszenie(e: React.FormEvent) {
      e.preventDefault();
      const tytul = noweOgl.tytul;
      const grupaId = noweOgl.grupa_id;
      const { error } = await supabase.from('ogloszenia').insert([{ typ: noweOgl.typ, tytul: noweOgl.tytul, tresc: noweOgl.tresc, szczegoly: noweOgl.szczegoly, nowe: true, data_utworzenia: new Date().toISOString(), grupa_id: noweOgl.grupa_id ? parseInt(noweOgl.grupa_id) : null }]);
      if (error) { setKomunikat('Blad: ' + error.message); } else {
        setKomunikat('Ogloszenie dodane!');
        setNoweOgl({ typ: 'Informacja', tytul: '', tresc: '', szczegoly: '', nowe: true, grupa_id: '' });
        pobierzOgloszenia();
        await wyslijPush(supabase, {
          grupa_id: grupaId ? parseInt(grupaId) : undefined,
          title: 'Nowe ogłoszenie',
          body: tytul,
          url: '/',
        });
      }
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
      const wiersze = tabelaZjazdow.filter(w => w.data_dzien1);
      if (wiersze.length === 0) { setKomunikat('Wypełnij co najmniej jeden wiersz (Nr + Data D1).'); return; }
      setTabelaZapis(true); setTabelaWyniki([]);
      const wyniki: { nr: string; status: string }[] = [];
      for (const w of wiersze) {
        const daty = w.data_dzien1 && w.data_dzien2
          ? `${new Date(w.data_dzien1).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' })}–${new Date(w.data_dzien2).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', year: 'numeric' })}`
          : new Date(w.data_dzien1).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', year: 'numeric' });
        const { data: nowy, error } = await supabase.from('zjazdy').insert([{
          nr: 0,
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
          godzina_start_d2: w.data_dzien2 ? (w.godzina_start_d1 || null) : null,
          godzina_end_d2: w.data_dzien2 ? (w.godzina_end_d1 || null) : null,
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
      
      const { data: zjazdyGrupy } = await supabase
        .from('zjazdy')
        .select('id, data_zjazdu')
        .eq('grupa_id', parseInt(tabelaGrupa))
        .order('data_zjazdu', { ascending: true });
      if (zjazdyGrupy) {
        for (let i = 0; i < zjazdyGrupy.length; i++) {
          await supabase.from('zjazdy').update({ nr: i + 1 }).eq('id', zjazdyGrupy[i].id);
        }
      }
      await pobierzZjazdy();
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
        zdjecie_url: edytowanyZjazd.zdjecie_url ?? null,
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
      
      setEdytowanyZjazd(null);
      const { data: zjazdyGrupy2 } = await supabase
        .from('zjazdy')
        .select('id, data_zjazdu')
        .eq('grupa_id', edytowanyZjazd.grupa_id)
        .order('data_zjazdu', { ascending: true });
      if (zjazdyGrupy2) {
        for (let i = 0; i < zjazdyGrupy2.length; i++) {
          await supabase.from('zjazdy').update({ nr: i + 1 }).eq('id', zjazdyGrupy2[i].id);
        }
      }
      pobierzZjazdy();
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
    user_id: nowyProwadzacy.user_id || null,
  }]);
      if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Prowadzący dodany!'); setNowyProwadzacy({ imie: '', nazwisko: '', bio: '', avatar_url: '', email: '', telefon: '', notatki: '', miasto: '', user_id: '' }); pobierzProwadzacy(); }
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
      const rola = (nowyKursant as any).rola || 'kursant';
      const { error } = await supabase.from('kursanci').insert([{ imie: nowyKursant.imie, nazwisko: nowyKursant.nazwisko, grupa_id: rola === 'kursant' ? parseInt(nowyKursant.grupa_id) : null, user_id: authData.user!.id, rola }]);
      if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Kursant dodany!'); setNowyKursant({ imie: '', nazwisko: '', email: '', grupa_id: '' }); const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny'); setKursanci((data || []) as unknown as KursantAdmin[]); }
    }

    async function dodajGrupe(e: React.FormEvent) {
      e.preventDefault();
      const { error } = await supabase.from('grupy').insert([{ nazwa: nowaGrupa.nazwa, miasto: nowaGrupa.miasto, edycja: nowaGrupa.edycja, drive_link: nowaGrupa.drive_link || null, numer_uslugi: nowaGrupa.numer_uslugi || null, tryb: nowaGrupa.tryb }]);
      if (error) { setKomunikat('Blad: ' + error.message); } else { setKomunikat('Grupa dodana!'); setNowaGrupa({ nazwa: '', miasto: '', edycja: '', drive_link: '', numer_uslugi: '', tryb: 'stacjonarny' }); pobierzGrupy(); }
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
        setNoweZadanie({ tytul: '', opis: '', termin: '', link_materialow: '', grupa_id: noweZadanie.grupa_id, typ: 'zadanie', zdjecie_url:'' });
        pobierzZadania();
      }
    }

    async function zapiszEdycjeZadania(e: React.FormEvent) {
      e.preventDefault();
      if (!edytowaneZadanie) return;
      const { error } = await supabase.from('zadania').update({
        tytul: edytowaneZadanie.tytul,
        opis: edytowaneZadanie.opis,
        termin: edytowaneZadanie.termin || null,
        link_materialow: edytowaneZadanie.link_materialow || null,
        typ: edytowaneZadanie.typ,
        zdjecie_url: edytowaneZadanie.zdjecie_url ?? null,
      }).eq('id', edytowaneZadanie.id);
      if (error) { setKomunikat('Błąd: ' + error.message); } else { setKomunikat('Zaktualizowano!'); setEdytowaneZadanie(null); pobierzZadania(); }
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

      let text: string;
      const hasBOM = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
      try {
        const decoder = new TextDecoder(hasBOM ? 'utf-8' : 'utf-8', { fatal: true });
        text = decoder.decode(buffer);
        if (!hasBOM && /[\x80-\x9F]/.test(text)) throw new Error('likely wrong encoding');
      } catch {
        const decoder = new TextDecoder('windows-1250');
        text = decoder.decode(buffer);
      }

      // Pobierz service_role key — potrzebny do tworzenia kont bez captcha
      const serviceKey = prompt('Wklej klucz service_role (Supabase → Settings → API):\n\nPotrzebny tylko do importu — nie jest zapisywany.');
      if (!serviceKey?.trim()) { alert('Anulowano — klucz jest wymagany do importu.'); return; }

      setImportowanie(true); setImportStatus([]);
      const firstLine = text.trim().split('\n')[0];
      const separator = firstLine.includes(';') ? ';' : ',';
      const rows = text.trim().split('\n').slice(1);
      const wyniki: { imie: string; nazwisko: string; email: string; status: string }[] = [];

      for (const row of rows) {
        if (!row.trim()) continue;
        const [imie, nazwisko, email, grupa_id] = row.split(separator).map(s => s.trim().replace(/^"|"$/g, '').replace(/\r/g, ''));
        if (!imie || !nazwisko || !email || !grupa_id) continue;

        // Użyj Admin API — omija captcha
        const SUPABASE_URL = 'https://bksebyxrknubyokwuaby.supabase.co';
        try {
          const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceKey.trim(),
              'Authorization': `Bearer ${serviceKey.trim()}`,
            },
            body: JSON.stringify({
              email,
              password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase() + '!',
              email_confirm: true,  // od razu potwierdzone, nie wymaga kliknięcia w maila
            }),
          });
          const authData = await res.json();
          if (!res.ok || !authData.id) {
            wyniki.push({ imie, nazwisko, email, status: 'Błąd: ' + (authData.msg || authData.message || res.status) });
            continue;
          }
          const { error } = await supabase.from('kursanci').insert([{
            imie, nazwisko, grupa_id: parseInt(grupa_id),
            user_id: authData.id, rola: 'kursant',
            email,
          }]);
          wyniki.push({ imie, nazwisko, email, status: error ? 'Błąd: ' + error.message : '✓ Dodano' });
        } catch (err: any) {
          wyniki.push({ imie, nazwisko, email, status: 'Błąd sieci: ' + err.message });
        }
        await new Promise(r => setTimeout(r, 500));
      }

      setImportStatus([...wyniki]);
      setImportowanie(false);
      const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
      setKursanci((data || []) as unknown as KursantAdmin[]);
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
    async function wyslijZaproszenie(kursant: KursantAdmin) {
      if (!kursant.email) { setKomunikat('Kursant nie ma adresu email!'); return; }
      let key = sessionStorage.getItem('sb_service_key') || '';
      if (!key) {
        const input = window.prompt('Wklej klucz service_role (Supabase → Settings → API):');
        if (!input?.trim()) return;
        key = input.trim();
        sessionStorage.setItem('sb_service_key', key);
      }
      setWysylanieZaproszenia(kursant.id);
      await naprawIWyslijEmail(kursant, key);
      const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
      setKursanci((data || []) as unknown as KursantAdmin[]);
      setWysylanieZaproszenia(null);
    }
    
    async function naprawIWyslijEmail(kursant: KursantAdmin, key: string) {
      const SUPABASE_URL = 'https://bksebyxrknubyokwuaby.supabase.co';
      try {
        // 1. Spróbuj zaprosić (nowe konto)
        const inviteRes = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({ email: kursant.email }),
        });
        const inviteData = await inviteRes.json();
    
        if (inviteRes.ok && inviteData.id) {
          // Nowe konto — zapisz prawdziwy UUID
          await supabase.from('kursanci').update({ user_id: inviteData.id }).eq('id', kursant.id);
          setKomunikat(`✓ Zaproszenie wysłane → ${kursant.email}`);
          return;
        }
    
        if (inviteRes.status === 422) {
          // Konto już istnieje — znajdź prawdziwy UUID po emailu
          const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
          });
          const listData = await listRes.json();const authUser = (listData.users || []).find((u: any) => u.email === (kursant.email ?? ''));
          
          if (!authUser) { setKomunikat(`Nie znaleziono konta dla ${kursant.email}`); return; }
    
          // Zaktualizuj user_id na prawdziwy UUID
          await supabase.from('kursanci').update({ user_id: authUser.id }).eq('id', kursant.id);
    
          // Wyślij email z ustawieniem hasła
          await supabase.auth.resetPasswordForEmail(kursant.email ?? '', {
            redirectTo: 'https://on-arch-akademia.vercel.app',
          });
          setKomunikat(`✓ UUID naprawiony + email z hasłem wysłany → ${kursant.email}`);
          return;
        }
    
        setKomunikat(`Błąd: ${inviteData.msg || inviteData.message || inviteRes.status}`);
      } catch (err: any) {
        setKomunikat(`Błąd sieci: ${err.message}`);
      }
    }
    function statusGrupy(grupaId: number): 'aktywna' | 'zakonczona' | 'brak' {
      const gz = zjazdy.filter(z => z.grupa_id === grupaId);
      if (gz.length === 0) return 'brak';
      return gz.some(z => z.status === 'nadchodzacy') ? 'aktywna' : 'zakonczona';
    }
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
              { id: 'zdjecia', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, label: 'Zdjęcia' },
              { id: 'materialy', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, label: 'Materiały' },
              { id: 'aplikacje', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: 'Aplikacje' },
              { id: 'backup',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, label: 'Backup' },
            ].map(item => (
              <button key={item.id}
              className={`biuro-sidebar-item ${aktywnaZakladka === item.id ? 'active' : ''}`}
              style={
                item.id === 'backup' && pokazBackupAlert ? { color: '#c62828', background: '#ffeaea' } :
                item.id === 'aplikacje' ? { color: '#5c3d8f' } : {}
              }
                onClick={() => { setKomunikat(''); setEdytowane(null); setEdytowanyZjazd(null); setAktywnaZakladka(item.id); }}>
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'backup' && pokazBackupAlert && (
                  <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#c62828', flexShrink: 0 }} />
                )}
                {item.id === 'aplikacje' && (
                  <span style={{ marginLeft: 'auto', fontSize: '8px', fontWeight: 700, background: '#5c3d8f', color: 'white', padding: '1px 6px', borderRadius: '999px', letterSpacing: '0.1em' }}>NEW</span>
                )}
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
              {aktywnaZakladka === 'aplikacje' && 'Aplikacje zewnętrzne'}
              {aktywnaZakladka === 'backup' && 'Backup'}
            </div>
            {pokazBackupAlert && (
              <div onClick={() => setAktywnaZakladka('backup')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffeaea', border: '0.5px solid #ffcdd2', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', animation: 'pulse-red 2s infinite' }}>
                <span style={{ fontSize: '16px' }}>💾</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#c62828' }}>Pobierz backup bazy danych</span>
                <span style={{ fontSize: '11px', color: '#e57373' }}>→</span>
              </div>
            )}
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
                    { id: 'zdjecia', label: 'Zdjęcia', opis: 'Zdjęcia w aplikacji', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
                    { id: 'materialy',  label: 'Materiały', opis: 'Lista produktów',  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
                    { id: 'aplikacje',  label: 'Aplikacje',  opis: 'Portale i sklepy partnerskie', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
                    { id: 'backup',     label: 'Backup',     opis: 'Pobierz kopię bazy',                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
                  ].map(k => (
                    <div key={k.id} onClick={() => setAktywnaZakladka(k.id)}
                    className="biuro-kafelek"
                    style={
                      k.id === 'backup' && pokazBackupAlert ? { borderColor: '#ffcdd2', background: '#fff5f5' } :
                      k.id === 'aplikacje' ? { borderColor: '#c9b8e8', background: 'linear-gradient(135deg, #f8f3ff 0%, #f3eefe 100%)', borderWidth: '1px' } : {}
                    }>
                      <div className="biuro-kafelek-icon" style={k.id === 'backup' && pokazBackupAlert ? { color: '#c62828' } : k.id === 'aplikacje' ? { color: '#5c3d8f' } : {}}>{k.icon}</div>
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
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '12px' }}>💡 Linki wklejone w treści będą automatycznie klikalne</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="login-btn" type="submit" style={{ flex: 1 }}>Zapisz zmiany</button>
                      <button className="btn-link" onClick={() => setEdytowane(null)}>Anuluj</button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Formularz + lista obok siebie na desktopie */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                          style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '4px' }} />
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>💡 Linki wklejone w treści będą automatycznie klikalne</div>
                        <button type="submit" style={{ width: '100%', padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                          + Dodaj ogłoszenie
                        </button>
                      </form>
                    </div>

                    {/* Lista ogłoszeń */}
                    <div style={{ flex: '2', minWidth: '300px', overflow: 'auto' }}>
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
                                <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                                  width: i === 0 ? '35%' : i === 1 ? '10%' : i === 2 ? '20%' : i === 3 ? '10%' : '90px'
                                }}>{h}</th>
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
                                  <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', width: '120px', minWidth: '120px' }}>
                                    <button onClick={() => { setEdytowane(o); setKomunikat(''); }}
                                      style={{ fontSize: '11px', padding: '3px 10px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif', marginRight: '4px' }}>
                                      Edytuj
                                    </button>
                                    <button onClick={() => usunOgloszenie(o.id)}
                                      style={{ fontSize: '11px', padding: '3px 8px', border: '0.5px solid #ffcdd2', borderRadius: '6px', background: '#fff5f5', cursor: 'pointer', color: '#e57373' }}>Usuń</button>
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

                    {/* Materiały do nauki — tylko dla grup PWO/POO */}
                    {(() => {
                      const grupa = grupy.find(g => g.id === edytowanyZjazd.grupa_id);
                      if (!grupa || !czyOdwroconaKlasa(grupa.nazwa)) return null;
                      return (
                        <div style={{ marginBottom: '12px' }}>
                          <SekcjaPrzygotowania zjazd={edytowanyZjazd} user={{ id: user?.id || '' }} czyProwadzacy={true} />
                        </div>
                      );
                    })()}
<div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>Zdjęcie zjazdu</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {edytowanyZjazd.zdjecie_url && (
                          <img src={edytowanyZjazd.zdjecie_url} alt="zdjęcie" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '0.5px solid var(--border)' }} />
                        )}
                        <button type="button" onClick={() => setPokazGalerieZjazd(true)}
                          style={{ padding: '7px 14px', borderRadius: '9px', border: '0.5px solid var(--border)', background: 'white', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', color: 'var(--brand)' }}>
                          {edytowanyZjazd.zdjecie_url ? '🖼 Zmień zdjęcie' : '🖼 Wybierz zdjęcie'}
                        </button>
                        {edytowanyZjazd.zdjecie_url && (
                          <button type="button" onClick={() => setEdytowanyZjazd({ ...edytowanyZjazd, zdjecie_url: null })}
                            style={{ padding: '7px', borderRadius: '9px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', color: '#e57373' }}>×</button>
                        )}
                      </div>
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
                        {['Data D1', 'Data D2', 'Godz. start', 'Godz. koniec', 'Typ', 'Sala / Link', 'Adres', 'Temat', 'Prowadzący', ''].map(h => (
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
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'auto' }}>
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
{edytowaneZadanie && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setEdytowaneZadanie(null)}>
            <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Edytuj zadanie</div>
                <button onClick={() => setEdytowaneZadanie(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
              </div>
              <form onSubmit={zapiszEdycjeZadania} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="login-field"><label>Tytuł</label><input value={edytowaneZadanie.tytul} onChange={e => setEdytowaneZadanie({ ...edytowaneZadanie, tytul: e.target.value })} required /></div>
                <div className="login-field"><label>Opis</label><textarea value={edytowaneZadanie.opis || ''} onChange={e => setEdytowaneZadanie({ ...edytowaneZadanie, opis: e.target.value })} rows={3} style={{ padding: '8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', fontSize: '13px', resize: 'vertical' }} /></div>
                <div className="login-field"><label>Termin</label><input type="date" value={edytowaneZadanie.termin || ''} onChange={e => setEdytowaneZadanie({ ...edytowaneZadanie, termin: e.target.value })} /></div>
                <div className="login-field"><label>Link do materiałów</label><input type="url" value={edytowaneZadanie.link_materialow || ''} onChange={e => setEdytowaneZadanie({ ...edytowaneZadanie, link_materialow: e.target.value })} /></div>
                <div className="login-field"><label>Typ</label>
                  <select value={edytowaneZadanie.typ} onChange={e => setEdytowaneZadanie({ ...edytowaneZadanie, typ: e.target.value })} style={{ padding: '8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }}>
                    <option value="zadanie">Zadanie domowe</option>
                    <option value="praca_zaliczeniowa">Praca zaliczeniowa</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>Zdjęcie zadania</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {edytowaneZadanie.zdjecie_url && <img src={edytowaneZadanie.zdjecie_url} alt="zdjęcie" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '0.5px solid var(--border)' }} />}
                    <button type="button" onClick={() => setPokazGalerieZadanie(true)}
                      style={{ padding: '7px 14px', borderRadius: '9px', border: '0.5px solid var(--border)', background: 'white', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', color: 'var(--brand)' }}>
                      {edytowaneZadanie.zdjecie_url ? '🖼 Zmień' : '🖼 Wybierz zdjęcie'}
                    </button>
                    {edytowaneZadanie.zdjecie_url && <button type="button" onClick={() => setEdytowaneZadanie({ ...edytowaneZadanie, zdjecie_url: null })} style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px' }}>×</button>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--brand-dark)', color: 'white', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Zapisz zmiany</button>
                  <button type="button" onClick={() => setEdytowaneZadanie(null)} style={{ padding: '10px 16px', borderRadius: '10px', border: '0.5px solid var(--border)', background: 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Anuluj</button>
                </div>
              </form>
            </div>
          </div>
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
                    <select value={(nowyKursant as any).rola || 'kursant'} onChange={e => setNowyKursant({ ...nowyKursant, ...(nowyKursant as any), rola: e.target.value })}
                        style={{ fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white', marginBottom: '8px', width: '100%' }}>
                        <option value="kursant">Kursant</option>
                        <option value="admin">Admin (biuro)</option>
                        <option value="prowadzacy">Prowadzący</option>
                      </select>
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

              {/* LISTA KURSANTÓW — płaska tabela */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <h2 className="page-title" style={{ margin: 0 }}>
                  Lista kursantów ({kursanci.filter(k => {
                    const s = szukajKursant.toLowerCase().trim();
                    const gOk = !filtrGrupaKursant || k.grupa_id === parseInt(filtrGrupaKursant);
                    const sOk = !s || `${k.imie} ${k.nazwisko}`.toLowerCase().includes(s) || (k.email || '').toLowerCase().includes(s);
                    return gOk && sOk;
                  }).length})
                </h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={szukajKursant} onChange={e => setSzukajKursant(e.target.value)} placeholder="Szukaj..."
                      style={{ paddingLeft: '28px', fontSize: '12px', padding: '7px 10px 7px 28px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', width: '180px' }} />
                  </div>
                  <select value={filtrGrupaKursant} onChange={e => setFiltrGrupaKursant(e.target.value)}
                    style={{ fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                    <option value="">Wszystkie grupy</option>
                    {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                  </select>
                  <button onClick={async () => {
  let key = sessionStorage.getItem('sb_service_key') || '';
  if (!key) {
    const input = window.prompt('Wklej klucz service_role:');
    if (!input?.trim()) return;
    key = input.trim();
    sessionStorage.setItem('sb_service_key', key);
  }
  const doNaprawy = kursanci.filter(k => k.email);
  setKomunikat(`Naprawiam ${doNaprawy.length} kont...`);
  for (const k of doNaprawy) {
    await naprawIWyslijEmail(k, key);
    await new Promise(r => setTimeout(r, 400));
  }
  const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
  setKursanci((data || []) as unknown as KursantAdmin[]);
  setKomunikat('✓ Wszyscy kursanci naprawieni');
}} style={{ fontSize: '12px', color: '#4338ca', background: '#eef2ff', border: '0.5px solid #6366f1', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
  ⚙ Napraw wszystkich
</button>
                  <button onClick={() => {
                    const naglowki = ['imie', 'nazwisko', 'email', 'telefon', 'grupa'];
                    const wiersze = kursanci.map(k => [`"${k.imie}"`, `"${k.nazwisko}"`, `"${k.email || ''}"`, `"${k.telefon || ''}"`, `"${grupy.find(g => g.id === k.grupa_id)?.nazwa || ''}"`].join(','));
                    const csv = '\uFEFF' + [naglowki.join(','), ...wiersze].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'kursanci.csv'; a.click();
                  }} style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                    ⬇ CSV
                  </button>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                      {['', 'Imię i Nazwisko', 'Email', 'Telefon', 'Grupa', ''].map((h, i) => (
                        <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kursanci.filter(k => {
                      const s = szukajKursant.toLowerCase().trim();
                      const gOk = !filtrGrupaKursant || k.grupa_id === parseInt(filtrGrupaKursant);
                      const sOk = !s || `${k.imie} ${k.nazwisko}`.toLowerCase().includes(s) || (k.email || '').toLowerCase().includes(s) || (k.telefon || '').includes(s);
                      return gOk && sOk;
                    }).sort((a, b) => `${a.nazwisko} ${a.imie}`.localeCompare(`${b.nazwisko} ${b.imie}`))
                    .map((k, idx) => {
                      const edytuje = edytowanyKursant?.id === k.id;
                      const rozwiniety = rozwinietaKursant === k.id;
                      const grupaName = grupy.find(g => g.id === k.grupa_id)?.nazwa || '—';
                      const dofinansowanie = (k as any).dofinansowanie;
                      const rowBg = edytuje ? '#fdf5f5' : dofinansowanie ? '#e8f0fe' : idx % 2 === 0 ? 'white' : '#fdf9f8';
                      return (
                        <>
                          <tr key={k.id} style={{ borderBottom: rozwiniety ? 'none' : '0.5px solid var(--border-soft)', background: rowBg, cursor: 'pointer' }}>
                            {/* Expand icon */}
                            <td style={{ padding: '6px 6px 6px 12px', width: '24px' }} onClick={() => !edytuje && setRozwinietaKursant(rozwiniety ? null : k.id)}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'inline-block', transform: rozwiniety ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>▾</span>
                            </td>
                            {/* Imię i Nazwisko */}
                            <td style={{ padding: '6px 10px' }} onClick={() => !edytuje && setRozwinietaKursant(rozwiniety ? null : k.id)}>
                              {edytuje ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <input value={edytowanyKursant.imie} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, imie: e.target.value })}
                                    style={{ width: '80px', fontSize: '11px', padding: '3px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                                  <input value={edytowanyKursant.nazwisko} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, nazwisko: e.target.value })}
                                    style={{ width: '100px', fontSize: '11px', padding: '3px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                                </div>
                              ) : <span style={{ fontWeight: 500, color: dofinansowanie ? '#1565c0' : 'var(--text)' }}>{k.imie} {k.nazwisko}</span>}
                            </td>
                            {/* Email */}
                            <td style={{ padding: '6px 10px' }} onClick={() => !edytuje && setRozwinietaKursant(rozwiniety ? null : k.id)}>
                              {edytuje ? (
                                <input value={edytowanyKursant.email} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, email: e.target.value })}
                                  style={{ width: '160px', fontSize: '11px', padding: '3px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                              ) : <span style={{ color: k.email ? 'var(--text-muted)' : '#ccc' }}>{k.email || '—'}</span>}
                            </td>
                            {/* Telefon */}
                            <td style={{ padding: '6px 10px' }} onClick={() => !edytuje && setRozwinietaKursant(rozwiniety ? null : k.id)}>
                              {edytuje ? (
                                <input value={edytowanyKursant.telefon} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, telefon: e.target.value })} placeholder="+48..."
                                  style={{ width: '110px', fontSize: '11px', padding: '3px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif' }} />
                              ) : k.telefon ? <span style={{ color: 'var(--text-muted)' }}>{k.telefon}</span> : <span style={{ color: '#ccc' }}>—</span>}
                            </td>
                            {/* Grupa */}
                            <td style={{ padding: '6px 10px' }} onClick={() => !edytuje && setRozwinietaKursant(rozwiniety ? null : k.id)}>
                              {edytuje ? (
                                <select value={(edytowanyKursant as any).grupa_id || ''} onChange={e => setEdytowanyKursant({ ...edytowanyKursant, ...(edytowanyKursant as any), grupa_id: e.target.value ? parseInt(e.target.value) : null })}
                                  style={{ fontSize: '11px', padding: '3px 6px', border: '0.5px solid var(--brand-mid)', borderRadius: '6px', fontFamily: 'Jost, sans-serif', background: 'white' }}>
                                  <option value="">Brak grupy</option>
                                  {grupy.map(g => <option key={g.id} value={g.id}>{g.nazwa}</option>)}
                                </select>
                              ) : <span
                              onClick={k.grupa_id ? e => { e.stopPropagation(); setAktywnaZakladka('grupy'); } : undefined}
                              style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '6px', background: k.grupa_id ? (dofinansowanie ? '#bbdefb' : 'var(--brand-light)') : '#f5f5f5', color: k.grupa_id ? (dofinansowanie ? '#1565c0' : 'var(--brand-dark)') : '#999', cursor: k.grupa_id ? 'pointer' : 'default', textDecoration: k.grupa_id ? 'underline dotted' : 'none' }}>{grupaName}</span>}
                            </td>
                            {/* Akcje */}
                            <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                              {edytuje ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button onClick={async () => {
                                    await supabase.from('kursanci').update({ imie: edytowanyKursant.imie, nazwisko: edytowanyKursant.nazwisko, email: edytowanyKursant.email || null, telefon: edytowanyKursant.telefon || null, grupa_id: (edytowanyKursant as any).grupa_id ?? k.grupa_id }).eq('id', k.id);
                                    const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
                                    setKursanci((data || []) as unknown as KursantAdmin[]);
                                    setEdytowanyKursant(null); setKomunikat('Zapisano!');
                                  }} style={{ fontSize: '11px', padding: '3px 9px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>✓</button>
                                  <button onClick={() => setEdytowanyKursant(null)}
                                    style={{ fontSize: '11px', padding: '3px 7px', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                 {k.email && (
                                    <button
                                    onClick={e => { e.stopPropagation(); wyslijZaproszenie(k); }}
                                    disabled={wysylanieZaproszenia === k.id}
                                    style={{ fontSize: '11px', padding: '3px 9px', border: '0.5px solid #6366f1', borderRadius: '6px', background: wysylanieZaproszenia === k.id ? '#e0e7ff' : '#eef2ff', cursor: wysylanieZaproszenia === k.id ? 'wait' : 'pointer', color: '#4338ca', fontFamily: 'Jost, sans-serif' }}>
                                    {wysylanieZaproszenia === k.id ? '...' : '✉ Zaproś'}
                                  </button>
                                  )}
                                  <button onClick={e => { e.stopPropagation(); setEdytowanyKursant({ id: k.id, imie: k.imie, nazwisko: k.nazwisko, email: k.email || '', telefon: k.telefon || '', ...(k as any) }); }}
                                    style={{ fontSize: '11px', padding: '3px 9px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>Edytuj</button>
                              
                                  <button onClick={async e => { e.stopPropagation(); if (window.confirm(`Usunąć ${k.imie} ${k.nazwisko}?`)) {
                                    await supabase.from('kursanci').delete().eq('id', k.id);
                                    const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
                                    setKursanci((data || []) as unknown as KursantAdmin[]); setKomunikat('Usunięto.');
                                  }}}
                                    style={{ fontSize: '11px', padding: '3px 6px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#e57373' }}>×</button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {/* Rozwinięty wiersz */}
                          {rozwiniety && (
                            <tr style={{ background: dofinansowanie ? '#f0f6ff' : '#fafaf8', borderBottom: '0.5px solid var(--border-soft)' }}>
                              <td colSpan={6} style={{ padding: '12px 16px 14px 46px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                                  {/* Certyfikat */}
                                  <div>
                                    <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '5px' }}>Certyfikat (link)</div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <input type="url" defaultValue={k.certyfikat_url || ''} placeholder="https://drive.google.com/..."
                                        onBlur={async e => {
                                          if (e.target.value !== (k.certyfikat_url || '')) {
                                            await supabase.from('kursanci').update({ certyfikat_url: e.target.value || null }).eq('id', k.id);
                                            setKomunikat(`Certyfikat zapisany — ${k.imie} ${k.nazwisko}`);
                                          }
                                        }}
                                        style={{ flex: 1, fontSize: '11px', padding: '5px 8px', borderRadius: '7px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', background: k.certyfikat_url ? '#f0faf4' : 'white' }} />
                                      {k.certyfikat_url && <a href={k.certyfikat_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', textDecoration: 'none' }}>🎓</a>}
                                    </div>
                                  </div>
                                  {/* Folder prywatny */}
                                  <div>
                                    <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '5px' }}>Folder prywatny (link)</div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <input type="url" defaultValue={(k as any).folder_prywatny || ''} placeholder="https://drive.google.com/..."
                                        onBlur={async e => {
                                          if (e.target.value !== ((k as any).folder_prywatny || '')) {
                                            await supabase.from('kursanci').update({ folder_prywatny: e.target.value || null } as any).eq('id', k.id);
                                            const { data: refreshed } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
                                            setKursanci((refreshed || []) as unknown as KursantAdmin[]);
                                            setKomunikat(`Folder prywatny zapisany — ${k.imie} ${k.nazwisko}`);
                                          }
                                        }}
                                        style={{ flex: 1, fontSize: '11px', padding: '5px 8px', borderRadius: '7px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', background: (k as any).folder_prywatny ? '#f3e8ff' : 'white' }} />
                                      {(k as any).folder_prywatny && <a href={(k as any).folder_prywatny} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', textDecoration: 'none' }}>🔒</a>}
                                    </div>
                                  </div>
                                  {/* Notatki */}
                                  <div>
                                    <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '5px' }}>Notatki</div>
                                    <textarea defaultValue={(k as any).notatki || ''} rows={2} placeholder="Notatka o kursancie..."
                                      onBlur={async e => {
                                        const val = e.target.value.trim();
                                        if (val !== ((k as any).notatki || '').trim()) {
                                          await supabase.from('kursanci').update({ notatki: val || null } as any).eq('id', k.id);
const { data: refreshed } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
setKursanci((refreshed || []) as unknown as KursantAdmin[]);
setKomunikat(`Notatka zapisana — ${k.imie} ${k.nazwisko}`);
                                        }
                                      }}
                                      style={{ width: '100%', fontSize: '11px', padding: '5px 8px', borderRadius: '7px', border: '0.5px solid var(--border)', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} />
                                  </div>
                                  {/* Dofinansowanie */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: dofinansowanie ? '#1565c0' : 'var(--text)' }}>
                                      <input type="checkbox" checked={!!dofinansowanie} onChange={async e => {
                                        await supabase.from('kursanci').update({ dofinansowanie: e.target.checked } as any).eq('id', k.id);
                                        const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
                                        setKursanci((data || []) as unknown as KursantAdmin[]);
                                        setKomunikat(e.target.checked ? `${k.imie} ${k.nazwisko} — dofinansowanie zaznaczone` : `${k.imie} ${k.nazwisko} — dofinansowanie odznaczone`);
                                      }} style={{ width: '16px', height: '16px', accentColor: '#1565c0', cursor: 'pointer' }} />
                                      Dofinansowanie
                                    </label>
                                    {dofinansowanie && <span style={{ fontSize: '10px', background: '#bbdefb', color: '#1565c0', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>Aktywne</span>}
                                  </div>
                                  {/* Usuń z grupy */}
                                  {k.grupa_id && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '20px' }}>
                                      <button onClick={async () => {
                                        if (window.confirm(`Usunąć ${k.imie} ${k.nazwisko} z grupy?`)) {
                                          await supabase.from('kursanci').update({ grupa_id: null }).eq('id', k.id);
                                          const { data } = await supabase.from('kursanci').select('id, imie, nazwisko, email, telefon, grupa_id, user_id, certyfikat_url, notatki, dofinansowanie, folder_prywatny');
                                          setKursanci((data || []) as unknown as KursantAdmin[]);
                                          setKomunikat('Usunięto z grupy.');
                                        }
                                      }} style={{ fontSize: '11px', padding: '5px 12px', border: '0.5px solid #fbbf24', borderRadius: '8px', background: '#fffbeb', cursor: 'pointer', color: '#92400e', fontFamily: 'Jost, sans-serif' }}>
                                        Usuń z grupy
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
                {kursanci.filter(k => {
                  const s = szukajKursant.toLowerCase().trim();
                  const gOk = !filtrGrupaKursant || k.grupa_id === parseInt(filtrGrupaKursant);
                  const sOk = !s || `${k.imie} ${k.nazwisko}`.toLowerCase().includes(s) || (k.email || '').toLowerCase().includes(s);
                  return gOk && sOk;
                }).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Brak kursantów</div>
                )}
              </div>
            </>
          )}

{aktywnaZakladka === 'grupy' && (
            <>
              {wybranaGrupaDetail !== null ? (() => {
                const g = grupy.find(x => x.id === wybranaGrupaDetail);
                if (!g) return null;
                const kursanciGrupy = kursanci.filter(k => k.grupa_id === g.id);
                const zjazdyGrupy = zjazdy.filter(z => z.grupa_id === g.id);
              
                const ogloszeniaGrupyOnly = ogloszenia.filter(o => o.grupa_id === g.id);
                const status = statusGrupy(g.id);
                const statusKolor = status === 'aktywna' ? { bg: '#e8f5e9', color: '#2e7d32' } : status === 'zakonczona' ? { bg: '#f5f5f5', color: '#9e9e9e' } : { bg: 'var(--bg)', color: 'var(--muted)' };
                const statusLabel = status === 'aktywna' ? 'AKTYWNA' : status === 'zakonczona' ? 'ZAKOŃCZONA' : 'BRAK ZJAZDÓW';

                return (
                  <>
                    {/* Nagłówek grupy */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setWybranaGrupaDetail(null); setZakladkaGrupy('kursanci'); }}
                        style={{ fontSize: '13px', padding: '6px 14px', border: '0.5px solid var(--border)', borderRadius: '8px', background: 'white', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ← Grupy
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: 'var(--brand-dark)', margin: 0 }}>{g.nazwa}</h2>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: statusKolor.bg, color: statusKolor.color, letterSpacing: '0.08em' }}>{statusLabel}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                          {g.miasto} · {g.edycja} {g.tryb && `· ${g.tryb}`}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                      {[
                        { label: 'Kursanci', val: kursanciGrupy.length, icon: '👤' },
                        { label: 'Zjazdy', val: zjazdyGrupy.length, icon: '📅' },
                        { label: 'Ogłoszenia', val: ogloszeniaGrupyOnly.length, icon: '📢' },
                      ].map(s => (
                        <div key={s.label} style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                          <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--brand-dark)' }}>{s.val}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'white', border: '0.5px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', width: 'fit-content' }}>
                    {(['kursanci', 'zjazdy', 'ogloszenia', 'ustawienia'] as const).map(tab => (
                        <button key={tab} onClick={() => setZakladkaGrupy(tab)}
                          style={{ padding: '8px 20px', border: 'none', background: zakladkaGrupy === tab ? 'var(--brand)' : 'white', color: zakladkaGrupy === tab ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}>
                          {tab === 'kursanci' ? `Kursanci (${kursanciGrupy.length})` : tab === 'zjazdy' ? `Zjazdy (${zjazdyGrupy.length})` : tab === 'ogloszenia' ? `Ogłoszenia (${ogloszeniaGrupyOnly.length})` : '⚙ Ustawienia'}
                        </button>
                      ))}
                    </div>

                    {/* TAB: KURSANCI */}
                    {zakladkaGrupy === 'kursanci' && (
                      <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', overflow: 'auto' }}>
                        {kursanciGrupy.length === 0 ? (
                          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Brak kursantów w tej grupie</div>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                                {['Imię i Nazwisko', 'Email', 'Telefon', 'Konto', ''].map((h, i) => (
                                  <th key={i} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {kursanciGrupy.map((k, idx) => (
                                <tr key={k.id} style={{ borderBottom: idx < kursanciGrupy.length - 1 ? '0.5px solid var(--border-soft)' : 'none', background: (k as any).dofinansowanie ? '#e8f0fe' : idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                                  <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text)' }}>{k.imie} {k.nazwisko}</td>
                                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{k.email || '—'}</td>
                                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{k.telefon || '—'}</td>
                                  <td style={{ padding: '10px 14px' }}>
                                    {k.user_id
                                      ? <span style={{ fontSize: '10px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>✓ Aktywne</span>
                                      : <span style={{ fontSize: '10px', background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Brak konta</span>
                                    }
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <button onClick={() => { setAktywnaZakladka('kursanci'); }}
                                      style={{ fontSize: '11px', padding: '3px 9px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>
                                      Edytuj
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* TAB: ZJAZDY */}
                    {zakladkaGrupy === 'zjazdy' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                          <button onClick={() => { setAktywnaZakladka('zjazdy'); setTabelaGrupa(String(g.id)); }}
                            style={{ fontSize: '12px', padding: '7px 16px', border: 'none', borderRadius: '9px', background: 'var(--brand)', color: 'white', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 600 }}>
                            + Dodaj zjazdy dla tej grupy →
                          </button>
                        </div>
                        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', overflow: 'auto' }}>
                          {zjazdyGrupy.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Brak zjazdów — dodaj przez przycisk powyżej</div>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                              <thead>
                                <tr style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
                                  {['#', 'Daty', 'Temat', 'Prowadzący', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {zjazdyGrupy.map((z, idx) => (
                                  <tr key={z.id} style={{ borderBottom: idx < zjazdyGrupy.length - 1 ? '0.5px solid var(--border-soft)' : 'none', background: idx % 2 === 0 ? 'white' : '#fdf9f8' }}>
                                    <td style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--brand-dark)', width: '32px' }}>{z.nr}</td>
                                    <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                                      {z.daty}
                                      {z.typ === 'online' && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#e8f0fe', color: '#1565c0', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>online</span>}
                                    </td>
                                    <td style={{ padding: '9px 14px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.tematy || '—'}</td>
                                    <td style={{ padding: '9px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{(z.prowadzacy || []).map((p: any) => `${p.imie} ${p.nazwisko}`).join(', ') || '—'}</td>
                                    <td style={{ padding: '9px 14px' }}>
                                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: z.status === 'nadchodzacy' ? '#e8f5e9' : '#f5f5f5', color: z.status === 'nadchodzacy' ? '#2e7d32' : '#999' }}>
                                        {z.status === 'nadchodzacy' ? 'Nadchodzący' : 'Zakończony'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                                      <button onClick={() => { setEdytowanyZjazd(z); setAktywnaZakladka('zjazdy'); }}
                                        style={{ fontSize: '11px', padding: '3px 10px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif', marginRight: '4px' }}>
                                        Edytuj
                                      </button>
                                      <button onClick={() => usunZjazd(z.id)}
                                        style={{ fontSize: '11px', padding: '3px 6px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#e57373' }}>×</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </>
                    )}

                    {/* TAB: OGŁOSZENIA */}
                    {zakladkaGrupy === 'ogloszenia' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Mini formularz */}
                        <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Nowe ogłoszenie dla: <span style={{ color: 'var(--brand)' }}>{g.nazwa}</span></div>
                          <form onSubmit={async e => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const typ = (form.querySelector('[name=typ]') as HTMLSelectElement).value;
                            const tytul = (form.querySelector('[name=tytul]') as HTMLInputElement).value;
                            const tresc = (form.querySelector('[name=tresc]') as HTMLInputElement).value;
                            const szczegoly = (form.querySelector('[name=szczegoly]') as HTMLTextAreaElement).value;
                            await supabase.from('ogloszenia').insert([{ typ, tytul, tresc, szczegoly, grupa_id: g.id, nowe: true, data_utworzenia: new Date().toISOString() }]);
                            pobierzOgloszenia();
                            form.reset();
                            setKomunikat('Ogłoszenie dodane!');
                          }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <select name="typ" style={{ flex: 1, fontSize: '12px', padding: '7px 8px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif' }}>
                                <option>Informacja</option><option>Pilne</option><option>Zmiana</option>
                              </select>
                            </div>
                            <input name="tytul" type="text" placeholder="Tytuł *" required style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                            <input name="tresc" type="text" placeholder="Krótki opis *" required style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', marginBottom: '8px' }} />
                            <textarea name="szczegoly" placeholder="Pełna treść (opcjonalnie)" rows={3} style={{ width: '100%', fontSize: '12px', padding: '7px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '8px' }} />
                            <button type="submit" style={{ width: '100%', padding: '8px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>+ Dodaj ogłoszenie</button>
                          </form>
                        </div>
                        {/* Lista ogłoszeń grupy */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                          {ogloszeniaGrupyOnly.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Brak ogłoszeń dla tej grupy</div>
                          ) : ogloszeniaGrupyOnly.map((o, idx) => (
                            <div key={o.id} style={{ padding: '12px 16px', borderBottom: idx < ogloszeniaGrupyOnly.length - 1 ? '0.5px solid var(--border-soft)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', flexShrink: 0, marginTop: '2px', background: o.typ === 'Pilne' ? '#ffeaea' : o.typ === 'Zmiana' ? '#fef9ec' : 'var(--brand-light)', color: o.typ === 'Pilne' ? '#c62828' : o.typ === 'Zmiana' ? '#c8a84b' : 'var(--brand-dark)' }}>{o.typ}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text)' }}>{o.tytul}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{o.tresc}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                <button onClick={() => { setEdytowane(o); setAktywnaZakladka('ogloszenia'); }}
                                  style={{ fontSize: '11px', padding: '3px 9px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>Edytuj</button>
                                <button onClick={() => usunOgloszenie(o.id)}
                                  style={{ fontSize: '11px', padding: '3px 6px', border: 'none', background: 'none', cursor: 'pointer', color: '#e57373' }}>×</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                  </>
                );
              })() : (
                <>
                  {/* Nagłówek + przycisk dodaj */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: 'var(--brand-dark)', margin: 0 }}>
                      Grupy <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>({grupy.length})</span>
                    </h2>
                    <button onClick={() => setPokazFormGrupy(v => !v)}
                      style={{ fontSize: '13px', padding: '8px 20px', border: pokazFormGrupy ? '0.5px solid var(--brand-mid)' : 'none', borderRadius: '10px', background: pokazFormGrupy ? 'white' : 'var(--brand)', color: pokazFormGrupy ? 'var(--brand)' : 'white', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 600, transition: 'all 0.15s' }}>
                      {pokazFormGrupy ? '✕ Anuluj' : '+ Dodaj grupę'}
                    </button>
                  </div>

                  {/* Formularz — zwijany */}
                  {pokazFormGrupy && (
                    <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Nowa grupa</div>
                      <form className="admin-form" onSubmit={async e => { await dodajGrupe(e); setPokazFormGrupy(false); }}>
                        <div className="login-field"><label>Nazwa grupy</label><input type="text" value={nowaGrupa.nazwa} onChange={e => setNowaGrupa({ ...nowaGrupa, nazwa: e.target.value })} required /></div>
                        <div className="login-field"><label>Miasto</label><input type="text" value={nowaGrupa.miasto} onChange={e => setNowaGrupa({ ...nowaGrupa, miasto: e.target.value })} required /></div>
                        <div className="login-field"><label>Edycja</label><input type="text" value={nowaGrupa.edycja} onChange={e => setNowaGrupa({ ...nowaGrupa, edycja: e.target.value })} required /></div>
                        <div className="login-field"><label>Strefa Wiedzy — link Google Drive</label><input type="url" value={nowaGrupa.drive_link} onChange={e => setNowaGrupa({ ...nowaGrupa, drive_link: e.target.value })} placeholder="https://drive.google.com/..." /></div>
                        <div className="login-field"><label>Link do materiałów online</label><input type="url" value={(nowaGrupa as any).link_materialow || ''} onChange={e => setNowaGrupa({ ...nowaGrupa, ...(nowaGrupa as any), link_materialow: e.target.value })} placeholder="https://..." /></div>
                        <div className="login-field"><label>Link do nagrań z zajęć</label><input type="url" value={(nowaGrupa as any).link_nagran || ''} onChange={e => setNowaGrupa({ ...nowaGrupa, ...(nowaGrupa as any), link_nagran: e.target.value })} placeholder="https://..." /></div>
                        <div className="login-field"><label>Numer usługi BUR</label><input type="text" value={nowaGrupa.numer_uslugi} onChange={e => setNowaGrupa({ ...nowaGrupa, numer_uslugi: e.target.value })} placeholder="np. 2025/09/24/195975/3028966" /></div>
                        <div className="login-field"><label>Tryb zajęć</label><select value={nowaGrupa.tryb} onChange={e => setNowaGrupa({ ...nowaGrupa, tryb: e.target.value })}><option value="stacjonarny">Stacjonarny</option><option value="online">Online</option><option value="hybrydowy">Hybrydowy</option></select></div>
                        <button className="login-btn" type="submit">Dodaj grupę</button>
                      </form>
                    </div>
                  )}

                  {/* Karty grup — aktywne */}
                  {grupy.filter(g => statusGrupy(g.id) !== 'zakonczona').length > 0 && (
                    <>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#2e7d32', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32', display: 'inline-block' }} />
                        Aktywne ({grupy.filter(g => statusGrupy(g.id) !== 'zakonczona').length})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                        {grupy.filter(g => statusGrupy(g.id) !== 'zakonczona').map(g => {
                            
                          const ileKursantow = kursanci.filter(k => k.grupa_id === g.id).length;
                          const ileZjazdow = zjazdy.filter(z => z.grupa_id === g.id).length;
                          return (
                            <div key={g.id} onClick={() => setWybranaGrupaDetail(g.id)}
                              style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--brand-mid)', padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.1s', position: 'relative', overflow: 'hidden' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--brand)' }} />
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 500, color: 'var(--brand-dark)', lineHeight: 1.3 }}>{g.nazwa}</div>
                                <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: '#e8f5e9', color: '#2e7d32', whiteSpace: 'nowrap', flexShrink: 0 }}>AKTYWNA</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span>📍 {g.miasto}</span><span>· {g.edycja}</span>
                                {g.tryb && <span style={{ background: g.tryb === 'online' ? '#e8f0fe' : 'var(--bg)', color: g.tryb === 'online' ? '#1565c0' : 'var(--text-muted)', padding: '1px 6px', borderRadius: '6px', fontWeight: 500 }}>
                                  {g.tryb === 'online' ? '🌐 Online' : g.tryb === 'hybrydowy' ? '⚡ Hybr.' : '📍 Stac.'}
                                </span>}
                              </div>
                              <div style={{ display: 'flex', gap: '12px', borderTop: '0.5px solid var(--border-soft)', paddingTop: '10px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>{ileKursantow}</span> kursantów</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>{ileZjazdow}</span> zjazdów</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Karty grup — zakończone */}
                  {grupy.filter(g => statusGrupy(g.id) === 'zakonczona').length > 0 && (
                    <>
                      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9e9e9e', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9e9e9e', display: 'inline-block' }} />
                        Zakończone ({grupy.filter(g => statusGrupy(g.id) === 'zakonczona').length})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {grupy.filter(g => statusGrupy(g.id) === 'zakonczona').map(g => {
                          const ileKursantow = kursanci.filter(k => k.grupa_id === g.id).length;
                          const ileZjazdow = zjazdy.filter(z => z.grupa_id === g.id).length;
                          return (
                            <div key={g.id} onClick={() => setWybranaGrupaDetail(g.id)}
                              style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', padding: '16px 18px', cursor: 'pointer', opacity: 0.65, transition: 'box-shadow 0.15s', position: 'relative', overflow: 'hidden' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 500, color: 'var(--brand-dark)', lineHeight: 1.3 }}>{g.nazwa}</div>
                                <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: '#f5f5f5', color: '#9e9e9e', whiteSpace: 'nowrap', flexShrink: 0 }}>ZAKOŃCZONA</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span>📍 {g.miasto}</span><span>· {g.edycja}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', borderTop: '0.5px solid var(--border-soft)', paddingTop: '10px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>{ileKursantow}</span> kursantów</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>{ileZjazdow}</span> zjazdów</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
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
{aktywnaZakladka === 'zdjecia' && <AdminZdjecia />}
{aktywnaZakladka === 'materialy' && (
            <AdminMaterialy />
          )}
          {aktywnaZakladka === 'aplikacje' && (() => {
            const APLIKACJE = [
              {
                label: 'Portal obecności online',
                opis: 'Raporty z obecności online Google Meets i Zoom',
                url: 'https://portal-obecnosci-online.vercel.app/',
                kolor: '#1565c0',
                bg: '#e8f0fe',
                ikona: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
              },
              {
                label: 'Portal dofinansowań',
                opis: 'Umowy i rozliczenia dofinansowań UP, BUR, inne',
                url: 'https://onarch-dofinansowania.vercel.app/',
                kolor: '#2e7d32',
                bg: '#e8f5e9',
                ikona: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
              },
              {
                label: 'Sprawdzanie prac zaliczeniowych',
                opis: 'Portal oceny i recenzji prac kursantów',
                url: 'https://onarch-evaluator.vercel.app/',
                kolor: '#B35758',
                bg: '#fceaea',
                ikona: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
              },
              {
                label: 'Ankiety PRZED i testy wiedzy',
                opis: 'Ankiety wstępne i weryfikacja wiedzy kursantów',
                url: 'https://onarch-testy.vercel.app/',
                kolor: '#c8a84b',
                bg: '#fef9ec',
                ikona: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              },
              {
                label: 'Wyjścia do sklepów partnerskich',
                opis: 'Zaplanowane wyjścia i możliwość dopisania się',
                url: 'https://onarch-wyjscia.vercel.app/',
                kolor: '#5c3d8f',
                bg: '#f3eefe',
                ikona: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
 
              },
            ];

            return (
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                  Zewnętrzne narzędzia i portale używane w procesie dydaktycznym. Kliknij kartę aby otworzyć portal w nowej zakładce.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {APLIKACJE.map((app, i) => (
                    <a key={i} href={app.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'white', borderRadius: '16px', border: '0.5px solid var(--border)', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start', transition: 'box-shadow 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: app.kolor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {app.ikona}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{app.label}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{app.opis}</div>
                          <div style={{ marginTop: '8px', fontSize: '10px', color: app.kolor, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Otwórz →</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div style={{ marginTop: '20px', padding: '14px 16px', background: '#fffbeb', borderRadius: '12px', border: '0.5px solid #fde68a', fontSize: '12px', color: '#92400e', lineHeight: 1.6 }}>
                  💡 Aby zmienić linki — znajdź tablicę <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: '4px' }}>APLIKACJE</code> w kodzie App.tsx w zakładce <strong>Aplikacje zewnętrzne</strong> i podmień wartości <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: '4px' }}>url</code>.
                </div>
              </div>
            );
          })()}
          {/* ZAKŁADKA: Backup */}
          {aktywnaZakladka === 'backup' && (
            <EkranBackup onBackupDone={() => setPokazBackupAlert(false)} />
          )}

          {/* ZAKŁADKA: Zadania */}
          {aktywnaZakladka === 'zadania' && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
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
                      <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>Zdjęcie zadania</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {noweZadanie.zdjecie_url && (
                      <img src={noweZadanie.zdjecie_url} alt="zdjęcie" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '0.5px solid var(--border)' }} />
                    )}
                    <button type="button" onClick={() => setPokazGalerieZadanie(true)}
                      style={{ padding: '7px 14px', borderRadius: '9px', border: '0.5px solid var(--border)', background: 'white', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', color: 'var(--brand)' }}>
                      {noweZadanie.zdjecie_url ? '🖼 Zmień zdjęcie' : '🖼 Wybierz zdjęcie'}
                    </button>
                    {noweZadanie.zdjecie_url && (
                      <button type="button" onClick={() => setNoweZadanie({ ...noweZadanie, zdjecie_url: '' })}
                        style={{ padding: '7px', borderRadius: '9px', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer', color: '#e57373' }}>×</button>
                    )}
                  </div>
                </div>
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
                                          <div style={{ marginTop: '8px', background: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', padding: '8px 10px 4px' }}>
                                              Przesłane prace ({odp.length})
                                            </div>
                                            {odp.map((o) => (
                                              <div key={o.id} style={{ padding: '6px 10px', borderTop: '0.5px solid var(--border-soft)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>{o.imie} {o.nazwisko}</span>
                                                  <a href={o.link_pracy} target="_blank" rel="noopener noreferrer"
                                                    style={{ fontSize: '11px', color: 'var(--brand)', textDecoration: 'none' }}>→ Otwórz pracę</a>
                                                  {o.komentarz && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{o.komentarz}</span>}
                                                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '8px',
                                                    background: o.sprawdzona ? '#e8f5e9' : '#fff8e1',
                                                    color: o.sprawdzona ? '#2e7d32' : '#c8a84b' }}>
                                                   {o.sprawdzona ? '✓ Sprawdzona' : '· Do sprawdzenia'}
                                                  </span>
                                                </div>
                                                {o.uwagi_prowadzacego && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' }}>💬 {o.uwagi_prowadzacego}</div>}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {odp.length === 0 && <span style={{ fontSize: '11px', color: '#ccc', marginTop: '4px', display: 'block' }}>Brak przesłanych prac</span>}
                                      </div>
                                      <button onClick={() => setEdytowaneZadanie(z)}
                                        style={{ fontSize: '11px', padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: '7px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif', marginRight: '4px' }}>Edytuj</button>
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
                  <div className="login-field"><label>User ID (UUID z Supabase Auth)</label><input type="text" value={nowyProwadzacy.user_id} onChange={e => setNowyProwadzacy({ ...nowyProwadzacy, user_id: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></div>
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
        {pokazGalerieZjazd && edytowanyZjazd && (
          <GaleriaZdjec
            onWybierz={url => setEdytowanyZjazd({ ...edytowanyZjazd, zdjecie_url: url })}
            onZamknij={() => setPokazGalerieZjazd(false)}
          />
        )}
        {pokazGalerieZadanie && (
          <GaleriaZdjec
            onWybierz={url => {
              if (edytowaneZadanie) setEdytowaneZadanie({ ...edytowaneZadanie, zdjecie_url: url });
              else setNoweZadanie({ ...noweZadanie, zdjecie_url: url });
            }}
            onZamknij={() => setPokazGalerieZadanie(false)}
          />
        )}
      </div>
    );
  }          

  function KartaOgloszenia({ o, onClick }: { o: Ogloszenie; onClick: () => void; key?: string | number }) {
    const tloIkony = o.typ === 'Pilne' ? '#fff3cd' : o.typ === 'Zmiana' ? '#f0faf4' : '#e8f4fd';
const ikonaKolor = o.typ === 'Pilne' ? '#c8a84b' : o.typ === 'Zmiana' ? '#2e7d32' : '#1565c0';
const ikonaSVG = o.typ === 'Pilne'
  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={o.typ === 'Pilne' ? 'white' : ikonaKolor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  : o.typ === 'Zmiana'
  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ikonaKolor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ikonaKolor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    return (
      <div className="fade-in" style={{ background: o.typ === 'Pilne' ? '#7d3f3f' : 'white', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', border: o.typ === 'Pilne' ? 'none' : '0.5px solid var(--border)' }} onClick={onClick}>
       <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: o.typ === 'Pilne' ? 'rgba(255,255,255,0.15)' : tloIkony, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ikonaSVG}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', background: o.typ === 'Pilne' ? 'rgba(255,255,255,0.2)' : o.typ === 'Zmiana' ? '#f0faf4' : '#e8f4fd', color: o.typ === 'Pilne' ? 'white' : o.typ === 'Zmiana' ? '#2e7d32' : '#1565c0', padding: '2px 8px', borderRadius: '8px', fontWeight: 600, textTransform: 'uppercase' as const }}>{o.typ}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {o.nowe && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: o.typ === 'Pilne' ? 'white' : '#7d3f3f' }} />}
              <span style={{ fontSize: '9px', color: o.typ === 'Pilne' ? 'rgba(255,255,255,0.5)' : '#9a8a80' }}>{new Date(o.data_utworzenia).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
          
          <div style={{ fontSize: '13px', fontWeight: 600, color: o.typ === 'Pilne' ? 'white' : '#2a1f1f', marginBottom: '3px' }}>{o.tytul}</div>
          <div style={{ fontSize: '11px', color: o.typ === 'Pilne' ? 'rgba(255,255,255,0.7)' : '#7a6a6a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{o.tresc}</div>
        </div>
        
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
 
//  
function EkranGlowny({ ogloszenia, zjazdy, user, kursant, onNavigate, zadania, odpowiedzi, grupaInfo }: {
  ogloszenia: Ogloszenie[];
  zjazdy: Zjazd[];
  user: User;
  kursant: Kursant | null;
  onNavigate: (zakl: string) => void;
  zadania: Zadanie[];
    odpowiedzi: ZadanieOdpowiedz[];
    grupaInfo?: Grupa | null;
  }) {
    const [countdown, setCountdown] = useState({ dni: 0, godz: 0, min: 0 });
    const [obecnosciNajblizszy, setObecnosciNajblizszy] = useState<Obecnosc[]>([]);
    const [frekwencja, setFrekwencja] = useState(0);
    const [heroPhoto, setHeroPhoto] = useState('/wnetrze.jpg');
  

    useEffect(() => {
      supabase.from('zdjecia_aplikacji').select('url, kategoria').order('kolejnosc')
        .then(({ data }) => {
          const hero = (data || []).find(z => z.kategoria === 'hero');
          if (hero) setHeroPhoto(hero.url);
        });
    }, []);

    const najblizszy = zjazdy.find(z => z.status === 'nadchodzacy');
    const imie = kursant?.imie || user.email.split('@')[0];
    const edycja = kursant?.grupy?.edycja || '';
    const wszystkieZjazdy = zjazdy.length;
    const zakonczone = zjazdy.filter(z => z.status === 'zakonczony').length;
    const procent = wszystkieZjazdy > 0 ? Math.round((zakonczone / wszystkieZjazdy) * 100) : 0;
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = circ * (1 - procent / 100);
    const noweOgl = ogloszenia.filter(o => o.nowe);
    

    useEffect(() => {
      if (!najblizszy?.data_dzien1) return;
      const update = () => {
        const target = new Date(najblizszy.data_dzien1 + 'T09:00:00');
        const diff = target.getTime() - Date.now();
        if (diff <= 0) { setCountdown({ dni: 0, godz: 0, min: 0 }); return; }
        setCountdown({
          dni: Math.floor(diff / 86400000),
          godz: Math.floor((diff % 86400000) / 3600000),
          min: Math.floor((diff % 3600000) / 60000),
        });
      };
      update();
      const id = setInterval(update, 30000);
      return () => clearInterval(id);
    }, [najblizszy?.data_dzien1]);

    useEffect(() => {
      if (!najblizszy?.id || !user?.id) return;
      supabase.from('obecnosci').select('*')
        .eq('zjazd_id', najblizszy.id).eq('user_id', user.id)
        .then(({ data }) => setObecnosciNajblizszy(data || []));
    }, [najblizszy?.id, user?.id]);

    useEffect(() => {
      if (!user?.id || zakonczone === 0) return;
      const zakonczone_ids = zjazdy.filter(z => z.status === 'zakonczony').map(z => z.id);
      supabase.from('obecnosci').select('*')
        .in('zjazd_id', zakonczone_ids).eq('user_id', user.id)
        .then(({ data }) => {
          const obecne = (data || []).filter(o => o.status === 'potwierdzono').length;
          const wszystkie = (data || []).length;
          setFrekwencja(wszystkie > 0 ? Math.round(obecne / wszystkie * 100) : 0);
        });
    }, [zakonczone, user?.id]);

    const wpis_d1 = obecnosciNajblizszy.find(o => o.dzien === 1);
    const wpis_d2 = obecnosciNajblizszy.find(o => o.dzien === 2);
    async function zapiszObecnoscHome(dzien: 1 | 2) {
      if (!najblizszy || !kursant) return;
      const istniejaca = obecnosciNajblizszy.find(o => o.dzien === dzien);
      if (istniejaca) {
        await supabase.from('obecnosci').delete().eq('id', istniejaca.id);
        setObecnosciNajblizszy(prev => prev.filter(o => o.id !== istniejaca.id));
      } else {
        const { data: nowy } = await supabase.from('obecnosci').insert([{
          zjazd_id: najblizszy.id, user_id: user.id, grupa_id: kursant.grupa_id,
          imie: kursant.imie, nazwisko: kursant.nazwisko, dzien, status: 'potwierdzono',
        }]).select().single();
        if (nowy) setObecnosciNajblizszy(prev => [...prev, nowy as Obecnosc]);
      }
    }

    const teraz = new Date();
    const dniTygodnia = ['ND','PN','WT','ŚR','CZW','PT','SOB'];
    const miesiace = ['STY','LUT','MAR','KWI','MAJ','CZE','LIP','SIE','WRZ','PAŹ','LIS','GRU'];
    const dataHeader = `${dniTygodnia[teraz.getDay()]} · ${teraz.getDate()} ${miesiace[teraz.getMonth()]}`;
    const SERIF = "'Cormorant Garamond', Georgia, serif";
    background: `url(${heroPhoto}) center/cover`

    const frekwencjaBars = Array.from({ length: 10 }, (_, i) => i < Math.round(frekwencja / 10));

    const dniLiczba = countdown.dni > 0 ? String(countdown.dni) : countdown.godz > 0 ? String(countdown.godz) : String(countdown.min);
    const dniLabel = countdown.dni > 0 ? 'dni' : countdown.godz > 0 ? 'godz' : 'min';

    function DetailRowDark({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', fontWeight: 600, minWidth: '48px', flexShrink: 0,
          }}>{label}</span>
          <span style={{
            fontSize: '12px', color: 'white',
            fontWeight: accent ? 600 : 400,
            opacity: accent ? 1 : 0.9,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>{value}</span>
        </div>
      );
    }
    return (
      <>
        {/* ── NOWY NAGŁÓWEK ── */}
        <div style={{
          margin: '-18px -16px 0', padding: '10px 16px',
          background: '#f8f5f0', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <OnArchLogo height={20} color="#2a1f1f" />
            {(edycja || wszystkieZjazdy > 0) && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.3px', paddingLeft: '8px', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
                {edycja}{wszystkieZjazdy > 0 ? ` · ${zakonczone}/${wszystkieZjazdy}` : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => onNavigate('ogloszenia')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a1f1f" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {noweOgl.length > 0 && <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)' }} />}
            </div>
            <div onClick={() => onNavigate('profil')} style={{ cursor: 'pointer' }}>
              {kursant?.avatar_url
                ? <img src={kursant.avatar_url} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }} alt="" />
                : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'white' }}>{imie[0]?.toUpperCase()}</div>
              }
            </div>
          </div>
        </div>

        {/* ── POWITANIE ── */}
        <div style={{ padding: '20px 0 16px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
            {dataHeader}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '36px', lineHeight: 1.05, color: 'var(--text)', marginBottom: '6px' }}>
            Cześć, {imie}.
          </div>
          {najblizszy && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Twój <strong style={{ color: 'var(--text)' }}>{najblizszy.nr}. zjazd</strong>{' '}
              {countdown.dni === 0 ? 'zaczyna się dziś!' : countdown.dni === 1 ? 'zaczyna się jutro.' : `zaczyna się za ${countdown.dni} dni.`}
            </div>
          )}
        </div>

        {/* ── ZJAZD + POSTĘP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', marginBottom: '12px' }}>
          {/* Karta zjazdu */}
          {najblizszy ? (
  <div onClick={() => onNavigate('zjazdy')} style={{
    position: 'relative', borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer', minHeight: '320px', background: '#1a1614', color: 'white',
    boxShadow: '0 30px 60px -25px rgba(0,0,0,0.35)',
  }}>
    <div style={{ position: 'absolute', inset: 0, background: `url(${heroPhoto}) center/cover`, filter: 'brightness(0.72) saturate(0.92)' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' }} />
    <div style={{ position: 'absolute', top: 14, left: 14, width: 16, height: 16, borderTop: '1px solid rgba(255,255,255,0.5)', borderLeft: '1px solid rgba(255,255,255,0.5)' }}/>
    <div style={{ position: 'absolute', top: 14, right: 14, width: 16, height: 16, borderTop: '1px solid rgba(255,255,255,0.5)', borderRight: '1px solid rgba(255,255,255,0.5)' }}/>
    <div style={{ position: 'absolute', bottom: 14, left: 14, width: 16, height: 16, borderBottom: '1px solid rgba(255,255,255,0.5)', borderLeft: '1px solid rgba(255,255,255,0.5)' }}/>
    <div style={{ position: 'absolute', bottom: 14, right: 14, width: 16, height: 16, borderBottom: '1px solid rgba(255,255,255,0.5)', borderRight: '1px solid rgba(255,255,255,0.5)' }}/>

    <div style={{ position: 'relative', padding: '24px 22px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Zjazd nr {najblizszy.nr}</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '20px', lineHeight: 1.2, color: 'white', maxWidth: '120px' }}>{najblizszy.daty}</div>
        </div>
        {dniLiczba !== '' && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '64px', lineHeight: 0.9, color: 'white', letterSpacing: '-0.02em' }}>{dniLiczba}</div>
            <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{dniLabel}</div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '24px', background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '6px', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        border: '0.5px solid rgba(255,255,255,0.14)',
      }}>
        <DetailRowDark label="Tryb" value={najblizszy.typ === 'online' ? 'Online' : 'Stacjonarnie'} accent={najblizszy.typ === 'online'}/>
        {najblizszy.typ === 'stacjonarny' && najblizszy.sala && najblizszy.sala !== 'Do uzupełnienia' && (
          <DetailRowDark label="Sala" value={najblizszy.sala}/>
        )}
        {najblizszy.typ === 'stacjonarny' && najblizszy.adres && (
          <DetailRowDark label="Adres" value={najblizszy.adres}/>
        )}
        {najblizszy.prowadzacy && najblizszy.prowadzacy.length > 0 && (
          <DetailRowDark label="Prowadzi" value={najblizszy.prowadzacy.map(p => `${p.imie} ${p.nazwisko}`).join(', ')}/>
        )}
        {najblizszy.typ === 'online' && najblizszy.link_online && (
          <a href={najblizszy.link_online} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{
              marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'white', color: '#1a1614', padding: '11px 16px', borderRadius: '4px',
              fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase',
              fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start',
            }}>
            Dołącz do zajęć →
          </a>
        )}
      </div>
    </div>
  </div>
) : (
            <div style={{ background: '#1C2B3A', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '190px' }}>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Brak zjazdu</span>
            </div>
          )}

          {/* Postęp + frekwencja */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Postęp</div>
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={r} fill="none" stroke="#f0ece7" strokeWidth="6" />
                  <circle cx="40" cy="40" r={r} fill="none" stroke="var(--brand)" strokeWidth="6"
                    strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: SERIF, fontSize: '20px', color: 'var(--brand)', lineHeight: 1 }}>{procent}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>%</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>{zakonczone} z {wszystkieZjazdy} zjazdów</div>
            </div>
            <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', padding: '14px', flex: 1 }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Frekwencja</div>
              <div style={{ fontFamily: SERIF, fontSize: '26px', fontWeight: 300, color: 'var(--text)', lineHeight: 1, marginBottom: '8px' }}>
                {frekwencja}<span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                {frekwencjaBars.map((active, i) => (
                  <div key={i} style={{ width: '8px', height: active ? '14px' : '7px', background: active ? '#1C2B3A' : '#e0dbd6', borderRadius: '2px' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── POTWIERDZENIE OBECNOŚCI ── */}
        {najblizszy && najblizszy.data_dzien1 && (
          <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', padding: '14px 16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Potwierdź obecność</span>
              <span style={{ fontSize: '9px', color: 'var(--brand)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{najblizszy.daty}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { dzien: 1, data: najblizszy.data_dzien1, wpis: wpis_d1 },
                ...(najblizszy.data_dzien2 ? [{ dzien: 2, data: najblizszy.data_dzien2, wpis: wpis_d2 }] : []),
              ].map(({ dzien, data, wpis }) => (
                <div key={dzien} onClick={() => zapiszObecnoscHome(dzien as 1 | 2)} style={{
                  flex: 1, borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                  background: wpis?.status === 'potwierdzono' ? '#1C2B3A' : 'white',
                  border: `1.5px solid ${wpis?.status === 'potwierdzono' ? '#1C2B3A' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: wpis?.status === 'potwierdzono' ? 'rgba(255,255,255,0.15)' : '#f0ece7' }}>
                    {wpis?.status === 'potwierdzono'
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '8px', color: wpis?.status === 'potwierdzono' ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      D{dzien} · {new Date(data).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: wpis?.status === 'potwierdzono' ? 'white' : 'var(--text)' }}>
                      {wpis?.status === 'potwierdzono' ? '✓ Będę' : 'Potwierdź'}
                    </div>
                    {wpis?.status === 'potwierdzono' && (
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>kliknij aby cofnąć</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ZADANIA ── */}
        <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', padding: '14px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Zadania</span>
              {zadania.length > 0 && <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '20px', color: 'var(--text)' }}>{zadania.length} aktywne</span>}
            </div>
            <button onClick={() => onNavigate('zadania')} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>
              Wszystkie →
            </button>
          </div>
          {zadania.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>Brak aktywnych zadań</div>
          ) : (() => {
            const ZDJECIA = [
              'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=200&q=70',
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=200&q=70',
              'https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=200&q=70',
              'https://images.unsplash.com/photo-1645334424307-6de7ff8f2f34?auto=format&fit=crop&w=200&q=70',
              'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=200&q=70',
            ];
            const KOLORY = ['#B35758', '#E9A72D', '#6B9C68', '#B35758', '#6B9C68'];
            return (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {zadania.slice(0, 3).map((z, idx) => (
                  <div key={z.id} onClick={() => onNavigate('zadania')} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', cursor: 'pointer',
                    borderBottom: idx < Math.min(zadania.length, 3) - 1 ? '0.5px solid var(--border-soft)' : 'none',
                  }}>
                    <div style={{ width: '4px', height: '44px', background: z.typ === 'praca_zaliczeniowa' ? '#c8a84b' : KOLORY[idx % KOLORY.length], borderRadius: '2px', flexShrink: 0 }} />
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `url(${ZDJECIA[idx % ZDJECIA.length]}) center/cover`, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.tytul}</div>
                      <div style={{ display: 'flex', gap: '5px', marginTop: '2px', alignItems: 'center' }}>
                        {z.termin && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>do {new Date(z.termin).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' })}</span>}
                      </div>
                    </div>
                    {(() => {
                      const wyslano = odpowiedzi.some(o => o.zadanie_id === z.id);
                      return (
                        <div style={{ fontSize: '9px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0,
                          background: wyslano ? 'rgba(107,156,104,0.15)' : z.typ === 'praca_zaliczeniowa' ? '#fef9ec' : '#f0ece7',
                          color: wyslano ? '#4a7a47' : z.typ === 'praca_zaliczeniowa' ? '#c8a84b' : 'var(--brand-dark)',
                          border: wyslano ? '0.5px solid #a8d4a5' : z.typ === 'praca_zaliczeniowa' ? '0.5px solid #e8d4a0' : '0.5px solid var(--border)',
                        }}>
                          {wyslano ? '✓ Przesłano' : z.typ === 'praca_zaliczeniowa' ? 'Zaliczenie' : 'Do zrobienia'}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── OGŁOSZENIA ── */}
        {ogloszenia.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Ogłoszenia</span>
              <button onClick={() => onNavigate('ogloszenia')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>
                {noweOgl.length > 0 ? `${noweOgl.length} nowe →` : 'Wszystkie →'}
              </button>
            </div>
            {(noweOgl.length > 0 ? noweOgl : ogloszenia).slice(0, 2).map(o => (
              <KartaOgloszenia key={o.id} o={o} onClick={() => onNavigate('ogloszenia')} />
            ))}
          </div>
        )}

        {/* ──{/* ── STREFA WIEDZY ── */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Strefa Wiedzy</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' as any }}>
            {[
              {
                kind: 'Online', title: 'Materiały dodatkowe', sub: 'kursy i artykuły',
                img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=70',
                href: (grupaInfo as any)?.link_materialow || null, dot: '#B35758',
              },
            
              { kind: 'Drive', title: 'Folder grupy', sub: 'Google Drive',
                img: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=400&q=70',
                href: grupaInfo?.drive_link || null, dot: '#4a7a47',
              },
              { kind: 'Wideo', title: 'Nagrania z zajęć', sub: 'dotyczy grup online',
                img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=70',
                href: (grupaInfo as any)?.link_nagran || null, dot: '#1565c0',
              },
            ].map((item, i) => (
              <div key={i} style={{ width: '155px', flexShrink: 0, cursor: item.href ? 'pointer' : 'default' }}
                onClick={() => item.href && window.open(item.href, '_blank')}>
                <div style={{ width: '155px', height: '110px', borderRadius: '14px', background: `url(${item.img}) center/cover`, position: 'relative', marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.dot }} />
                    <span style={{ padding: '2px 7px', background: 'rgba(255,255,255,0.9)', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, borderRadius: '999px', color: '#1a1614' }}>{item.kind}</span>
                  </div>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEPARATOR + DODATKOWE ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 14px' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>dodatkowo</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
        </div>

        <div onClick={() => onNavigate('materialy')} style={{ cursor: 'pointer', marginBottom: '8px', borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(135deg, #fdf6e8 0%, #fef9f0 100%)', border: '0.5px solid #e8d4a0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#c8a84b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#a07830', fontWeight: 700, marginBottom: '3px' }}>Nowość</div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#2a1f1f', marginBottom: '2px' }}>Materiały do zakupu</div>
              <div style={{ fontSize: '11px', color: '#a07830' }}>Polecane przez prowadzących →</div>
            </div>
          </div>
        </div>

        <a href="https://on-arch.pl/faq-odpowiedzi-na-najczesciej-zadawane-pytania/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'white', border: '0.5px solid var(--border)', borderRadius: '14px', textDecoration: 'none', marginBottom: '8px', gap: '4px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>FAQ</div>
          <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>Najczęściej zadawane pytania</div>
          <div style={{ fontSize: '11px', color: 'var(--brand)', marginTop: '2px' }}>Czytaj więcej →</div>
        </a>

        <div style={{ marginTop: '16px', padding: '20px', background: '#FBF8F3', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Kontakt z biurem</div>
          <a href="tel:+48533718412" style={{ display: 'block', fontFamily: SERIF, fontStyle: 'italic', fontSize: '22px', color: 'var(--brand-dark)', textDecoration: 'none', marginBottom: '4px' }}>+48 533 718 412</a>
          <a href="mailto:info@on-arch.pl" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>info@on-arch.pl</a>
        </div>

        <div style={{ marginTop: '10px', padding: '14px 16px', background: 'white', border: '0.5px solid var(--border)', borderRadius: '4px', marginBottom: '16px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', marginBottom: '10px' }}>Obserwuj nas</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {[{ href: 'https://www.facebook.com/OnArchKursy/', label: 'Facebook' }, { href: 'https://www.instagram.com/on_arch_/', label: 'Instagram' }, { href: 'https://www.youtube.com/@on-arch', label: 'YouTube' }, { href: 'https://www.tiktok.com/@onarchpl', label: 'TikTok' }].map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
            ))}
          </div>
        </div>
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

  
  function KafelekDnia(props: any) {
    const { zjazd, dzien, label, wpis, aktywnyFormularz, setAktywnyFormularz, zapiszObecnosc, usunObecnosc, odswiezObecnosci, wysylanie } = props;
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

  function EkranZjazdy({ zjazdy, user, kursant, grupaInfo }: { zjazdy: Zjazd[]; user: User; kursant: Kursant | null; grupaInfo?: Grupa | null }) {
    const [obecnosci, setObecnosci] = useState<Obecnosc[]>([]);
    const [modalProwadzacy, setModalProwadzacy] = useState<Prowadzacy | null>(null);
    const [aktywnyFormularz, setAktywnyFormularz] = useState<{ zjazdId: number; dzien: 1 | 2; typ: 'obecnosc' | 'nieobecnosc' | 'godziny'; powod?: string; godzPrzyb?: string; godzWyj?: string } | null>(null);
    const [wysylanie, setWysylanie] = useState(false);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
    const [wybranyZjazd, setWybranyZjazd] = useState<Zjazd | null>(null);
    const [countdown, setCountdown] = useState({ dni: 0, godz: 0, min: 0 });
  
    const SERIF = "'Cormorant Garamond', Georgia, serif";
    const [dbPhotos, setDbPhotos] = useState<string[]>([]);
  const PHOTOS_FALLBACK = [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=900&q=80',
  ];
  const PHOTOS = dbPhotos.length > 0 ? dbPhotos : PHOTOS_FALLBACK;

  useEffect(() => {
    const kat = 'zjazdy'; // lub 'zadania' w EkranZadania
    supabase.from('zdjecia_aplikacji').select('url').eq('kategoria', kat).order('kolejnosc')
      .then(({ data }) => { if (data && data.length > 0) setDbPhotos(data.map(z => z.url)); });
  }, []);
    const najblizszy = zjazdy.find(z => z.status === 'nadchodzacy');
    const filtered = filter === 'all' ? zjazdy
      : filter === 'upcoming' ? zjazdy.filter(z => z.status === 'nadchodzacy')
      : zjazdy.filter(z => z.status === 'zakonczony');
  
    useEffect(() => {
      if (!najblizszy?.data_dzien1) return;
      const update = () => {
        const target = new Date(najblizszy.data_dzien1 + 'T09:00:00');
        const diff = target.getTime() - Date.now();
        if (diff <= 0) { setCountdown({ dni: 0, godz: 0, min: 0 }); return; }
        setCountdown({ dni: Math.floor(diff / 86400000), godz: Math.floor((diff % 86400000) / 3600000), min: Math.floor((diff % 3600000) / 60000) });
      };
      update();
      const id = setInterval(update, 30000);
      return () => clearInterval(id);
    }, [najblizszy?.data_dzien1]);
  
    useEffect(() => {
      if (!user) return;
      supabase.from('obecnosci').select('*').eq('user_id', user.id).then(({ data }) => setObecnosci(data || []));
    }, [user]);
  
    async function odswiezObecnosci() {
      const { data } = await supabase.from('obecnosci').select('*').eq('user_id', user.id);
      setObecnosci(data || []);
    }
  
    const pobierzDzien = (zjazdId: number, dzien: 1 | 2) => obecnosci.find(o => o.zjazd_id === zjazdId && o.dzien === dzien);
  
    async function zapiszObecnosc(zjazd: Zjazd, dzien: 1 | 2, status: 'potwierdzono' | 'nieobecnosc') {
      if (!kursant) return;
      setWysylanie(true);
      const istniejaca = pobierzDzien(zjazd.id, dzien);
      const powod = aktywnyFormularz?.powod || '';
      if (istniejaca) {
        await supabase.from('obecnosci').update({ status, powod_nieobecnosci: status === 'nieobecnosc' ? powod : null, zweryfikowano: false }).eq('id', istniejaca.id);
      } else {
        await supabase.from('obecnosci').insert([{ zjazd_id: zjazd.id, user_id: user.id, grupa_id: kursant.grupa_id, imie: kursant.imie, nazwisko: kursant.nazwisko, dzien, status, powod_nieobecnosci: status === 'nieobecnosc' ? powod : null }]);
      }
      await odswiezObecnosci();
      setAktywnyFormularz(null);
      setWysylanie(false);
    }
  
    async function usunObecnosc(zjazdId: number, dzien: 1 | 2) {
      await supabase.from('obecnosci').delete().eq('zjazd_id', zjazdId).eq('user_id', user.id).eq('dzien', dzien);
      await odswiezObecnosci();
    }
  
    function pobierzICS(z: Zjazd) {
      const formatData = (data: string, godzina?: string | null) => {
        const d = data.replace(/-/g, '');
        if (!godzina) return d;
        const [h, m] = godzina.split(':');
        return `${d}T${h}${m}00`;
      };
      const nastepnyDzien = (data: string) => {
        const d = new Date(data); d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0].replace(/-/g, '');
      };
      const teraz = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const linie: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ON-ARCH//PL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
      const dodajDzien = (data: string, gStart?: string | null, gEnd?: string | null, nr: number = 1) => {
        const prowadzacy = (z.prowadzacy || []).map(p => `${p.imie} ${p.nazwisko}`).join(', ');
        const lokalizacja = z.typ === 'online' ? 'Online' : [z.sala, z.adres].filter(Boolean).join(', ');
        const allDay = !gStart;
        const start = allDay ? formatData(data) : formatData(data, gStart);
        const end = allDay ? nastepnyDzien(data) : formatData(data, gEnd);
        linie.push('BEGIN:VEVENT', `UID:onarch-${z.id}-${nr}@on-arch.pl`, `DTSTAMP:${teraz}`, `DTSTART${allDay ? ';VALUE=DATE' : ''}:${start}`, `DTEND${allDay ? ';VALUE=DATE' : ''}:${end}`, `SUMMARY:ON-ARCH Zjazd ${z.nr} Dzien ${nr}`);
        if (lokalizacja) linie.push(`LOCATION:${lokalizacja}`);
        if (prowadzacy) linie.push(`DESCRIPTION:Prowadzacy: ${prowadzacy}`);
        linie.push('END:VEVENT');
      };
      if (z.data_dzien1) dodajDzien(z.data_dzien1, z.godzina_start_d1, z.godzina_end_d1, 1);
      if (z.data_dzien2) dodajDzien(z.data_dzien2, z.godzina_start_d2, z.godzina_end_d2, 2);
      linie.push('END:VCALENDAR');
      const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(linie.join('\r\n'));
      const a = document.createElement('a'); a.href = dataUri; a.download = `onarch-zjazd-${z.nr}.ics`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  
    // ── WIDOK SZCZEGÓŁÓW ──
    if (wybranyZjazd) {
      const z = wybranyZjazd;
      const zIdx = zjazdy.findIndex(zj => zj.id === z.id);
      const photo = z.zdjecie_url || PHOTOS[zIdx % PHOTOS.length];;
      return (
        <>
          <div style={{ margin: '-18px -16px 0', position: 'relative', height: '260px' }}>
            <div style={{ position: 'absolute', inset: 0, background: `url(${photo}) center/cover` }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, var(--bg, #f8f5f0) 100%)' }} />
            <button onClick={() => setWybranyZjazd(null)} style={{ position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.92)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F0E0C" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <div style={{ position: 'absolute', bottom: 32, left: 18, right: 18, color: '#fff' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '6px' }}>
                Zjazd {z.nr}{z.status === 'nadchodzacy' && countdown.dni > 0 ? ` · za ${countdown.dni} dni` : z.status === 'zakonczony' ? ' · Zakończony' : ''}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '26px', lineHeight: 1.1 }}>{z.daty}</div>
            </div>
          </div>
  
          <div style={{ paddingTop: '16px' }}>
            {z.tematy && <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '20px', color: 'var(--text)', marginBottom: '14px', lineHeight: 1.3 }}>{z.tematy}</div>}
  
            {/* Info grid */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '0.5px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Data</div>
                  <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '20px', color: 'var(--text)' }}>{z.daty}</div>
                  {z.godzina_start_d1 && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{z.godzina_start_d1}–{z.godzina_end_d1}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Tryb</div>
                  <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '20px', color: 'var(--text)' }}>{z.typ === 'online' ? 'Online' : 'Stacjonarnie'}</div>
                  {z.typ !== 'online' && z.sala && z.sala !== 'Do uzupełnienia' && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{z.sala}</div>}
                </div>
              </div>
              {z.typ !== 'online' && z.adres && z.adres !== 'Do uzupełnienia' && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '0.5px solid var(--border-soft)' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Adres</div>
                  <div style={{ fontSize: '13px', color: 'var(--text)' }}>{z.adres}</div>
                </div>
              )}
            </div>
  
            {/* Link online */}
            {z.typ === 'online' && z.link_online && (
              <a href={z.link_online} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1565c0', borderRadius: '14px', padding: '14px 16px', textDecoration: 'none', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>Zajęcia online</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Dołącz do Google Meet →</div>
                </div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </a>
            )}
  
            {/* Prowadzący */}
            {z.prowadzacy && z.prowadzacy.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>Prowadzący</div>
                {z.prowadzacy.map(p => (
                  <button key={p.id} onClick={() => setModalProwadzacy(p)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left', fontFamily: 'inherit' }}>
                    {p.avatar_url
                      ? <img src={p.avatar_url} alt={p.imie} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }} />
                      : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--brand)', flexShrink: 0 }}>{p.imie[0]}{p.nazwisko[0]}</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{p.imie} {p.nazwisko}</div>
                      {p.bio && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.bio}</div>}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--brand)', flexShrink: 0 }}>info →</span>
                  </button>
                ))}
              </div>
            )}
  
            {/* Obecność */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>Twoja obecność</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <KafelekDnia zjazd={z} dzien={1} wpis={obecnosci.find(o => o.zjazd_id === z.id && o.dzien === 1)} aktywnyFormularz={aktywnyFormularz} setAktywnyFormularz={setAktywnyFormularz} zapiszObecnosc={zapiszObecnosc} usunObecnosc={usunObecnosc} odswiezObecnosci={odswiezObecnosci} wysylanie={wysylanie} label={z.data_dzien1 ? new Date(z.data_dzien1).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Dzień 1'} />
                {z.data_dzien2 && <KafelekDnia zjazd={z} dzien={2} wpis={obecnosci.find(o => o.zjazd_id === z.id && o.dzien === 2)} aktywnyFormularz={aktywnyFormularz} setAktywnyFormularz={setAktywnyFormularz} zapiszObecnosc={zapiszObecnosc} usunObecnosc={usunObecnosc} odswiezObecnosci={odswiezObecnosci} wysylanie={wysylanie} label={new Date(z.data_dzien2).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })} />}
              </div>
            </div>
  
            {/* Dodaj do kalendarza */}
            {z.status === 'nadchodzacy' && (
              <button onClick={() => pobierzICS(z)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: 'none', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '11px 16px', fontSize: '12px', color: 'var(--brand)', cursor: 'pointer', fontFamily: 'Jost, sans-serif', marginBottom: '10px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Dodaj do kalendarza (.ics)
              </button>
            )}
  
            {/* PWO sekcja */}
            {grupaInfo && czyOdwroconaKlasa(grupaInfo.nazwa) && (
              <SekcjaPrzygotowania zjazd={z} user={user} kursant={kursant} />
            )}
          </div>
          {modalProwadzacy && <ModalProwadzacy p={modalProwadzacy} onZamknij={() => setModalProwadzacy(null)} />}
        </>
      );
    }
  
    // ── WIDOK LISTY ──
    return (
      <>
        {/* Nagłówek */}
        <div style={{ padding: '4px 0 16px' }}>
          <div style={{ fontSize: '9.5px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            {kursant?.grupy?.edycja || ''}{zjazdy.length > 0 ? ` · ${zjazdy.length} zjazdów` : ''}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '38px', lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--text)' }}>Zjazdy</div>
        </div>
  
        {/* Filtry */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', scrollbarWidth: 'none' as any }}>
          {([['all', 'Wszystkie'], ['upcoming', 'Najbliższe'], ['past', 'Minione']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ padding: '7px 14px', borderRadius: 999, background: filter === id ? '#1A1715' : 'transparent', color: filter === id ? '#fff' : 'var(--text)', border: filter === id ? 'none' : '0.5px solid var(--border)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Jost, sans-serif' }}>{label}</button>
          ))}
        </div>
  
        {/* Karty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((z) => {
            const zIdx = zjazdy.findIndex(zj => zj.id === z.id);
            const photo = z.zdjecie_url || PHOTOS[zIdx % PHOTOS.length];;
            const isHero = z.id === najblizszy?.id;
            const d1 = obecnosci.find(o => o.zjazd_id === z.id && o.dzien === 1);
            const d2 = obecnosci.find(o => o.zjazd_id === z.id && o.dzien === 2);
            const obecny = d1?.status === 'potwierdzono' || d2?.status === 'potwierdzono';
  
            if (isHero) return (
              <button key={z.id} onClick={() => setWybranyZjazd(z)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', padding: 0, background: 'transparent', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ position: 'relative', minHeight: '210px', background: '#0F0E0C', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', gap: '14px' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `url(${photo}) center/cover`, opacity: 0.38 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,14,12,0.25) 0%, rgba(15,14,12,0.88) 85%)' }} />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: '#B35758', boxShadow: '0 0 0 4px rgba(179,87,88,0.25)', display: 'block', flexShrink: 0 }} />
                    <span style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Wkrótce</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase', opacity: 0.72, color: 'white', marginBottom: '6px' }}>Zjazd {z.nr} · {z.daty}</div>
                    {z.tematy && <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '21px', lineHeight: 1.1, color: 'white', marginBottom: '14px' }}>{z.tematy}</div>}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                      {[{ n: String(countdown.dni).padStart(2,'0'), l: 'dni' }, { n: String(countdown.godz).padStart(2,'0'), l: 'godz' }, { n: String(countdown.min).padStart(2,'0'), l: 'min' }].map(({ n, l }) => (
                        <div key={l} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px' }}>
                          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '22px', lineHeight: 1, color: '#fff' }}>{n}</div>
                          <div style={{ fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#fff', color: '#0F0E0C', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Szczegóły i obecność</span><span>→</span>
                    </div>
                  </div>
                </div>
              </button>
            );
  
            return (
              <button key={z.id} onClick={() => setWybranyZjazd(z)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'white', borderRadius: '16px', padding: '12px 14px', border: '0.5px solid var(--border)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}>
                <div style={{ width: '56px', height: '70px', borderRadius: '10px', background: `url(${photo}) center/cover`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Zjazd {z.nr} · {z.daty}</div>
                  {z.tematy && <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '16px', lineHeight: 1.2, color: 'var(--text)', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{z.tematy}</div>}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{z.typ === 'online' ? '🌐 Online' : '📍 Stacjonarnie'}</span>
                    {z.prowadzacy && z.prowadzacy.length > 0 && <><span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-muted)', display: 'block' }} /><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{z.prowadzacy.map(p => p.imie).join(', ')}</span></>}
                  </div>
                </div>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {z.status === 'zakonczony' && obecny && <span style={{ fontSize: '9px', color: '#4a7a47', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>✓ Obecna</span>}
                  {z.status === 'zakonczony' && !obecny && <span style={{ fontSize: '9px', color: '#999', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>—</span>}
                  {z.status === 'nadchodzacy' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>›</span>}
                </div>
              </button>
            );
          })}
        </div>
  
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)', fontFamily: SERIF, fontStyle: 'italic', fontSize: '18px' }}>Brak zjazdów w tej kategorii</div>
        )}
  
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
      </>
    );
  }

  

  // ─── KALENDARZ ZJAZDÓW ───────────────────────────────────────────────────────

  // ─── SEKCJA PRZYGOTOWANIA DO ZJAZDU (odwrócona klasa) ────────────────────────

  function SekcjaPrzygotowania({ zjazd, user, kursant, czyProwadzacy = false }: {
    zjazd: Zjazd; user: { id: string }; kursant?: { imie: string; nazwisko: string } | null; czyProwadzacy?: boolean;
  }) {
    const [materialy, setMaterialy] = useState<MaterialZjazdu[]>([]);
    const [pytania, setPytania] = useState<PytanieZjazdu[]>([]);
    const [nowyMat, setNowyMat] = useState({ tytul: '', link: '' });
    const [nowePytanie, setNowePytanie] = useState('');
    const [edytowanePytanie, setEdytowanePytanie] = useState<number | null>(null);
    const [edytowanaTresc, setEdytowanaTresc] = useState('');
    const [ladowanie, setLadowanie] = useState(true);

    useEffect(() => {
      pobierz();
    }, [zjazd.id]);

    async function pobierz() {
      setLadowanie(true);
      const [{ data: mat }, { data: pyt }] = await Promise.all([
        supabase.from('materialy_zjazdu').select('*').eq('zjazd_id', zjazd.id).order('kolejnosc'),
        supabase.from('pytania_przed_zjazdem').select('*').eq('zjazd_id', zjazd.id).order('created_at'),
      ]);
      setMaterialy(mat || []);
      setPytania(pyt || []);
      setLadowanie(false);
    }

    async function dodajMaterial(e?: any) {
      if (e?.preventDefault) e.preventDefault();
      if (!nowyMat.tytul.trim()) return;
      const { error } = await supabase.from('materialy_zjazdu').insert([{
        zjazd_id: zjazd.id, tytul: nowyMat.tytul.trim(),
        link: nowyMat.link.trim() || null, kolejnosc: materialy.length,
      }]);
      if (error) { alert('Błąd zapisu: ' + error.message); return; }
      setNowyMat({ tytul: '', link: '' });
      pobierz();
    }

    async function usunMaterial(id: number) {
      await supabase.from('materialy_zjazdu').delete().eq('id', id);
      pobierz();
    }

    async function dodajPytanie(e: React.FormEvent) {
      e.preventDefault();
      if (!nowePytanie.trim() || !kursant) return;
      await supabase.from('pytania_przed_zjazdem').insert([{
        zjazd_id: zjazd.id, user_id: user.id,
        imie: kursant.imie, nazwisko: kursant.nazwisko,
        tresc: nowePytanie.trim(),
      }]);
      setNowePytanie('');
      pobierz();
    }

    async function zapiszEdycje(id: number) {
      if (!edytowanaTresc.trim()) return;
      await supabase.from('pytania_przed_zjazdem').update({ tresc: edytowanaTresc.trim() }).eq('id', id);
      setEdytowanePytanie(null);
      pobierz();
    }

    async function usunPytanie(id: number) {
      await supabase.from('pytania_przed_zjazdem').delete().eq('id', id);
      pobierz();
    }

    async function toggleOmowione(id: number, obecny: boolean) {
      await supabase.from('pytania_przed_zjazdem').update({ omowione: !obecny }).eq('id', id);
      pobierz();
    }

    const mojePytania = pytania.filter(p => p.user_id === user.id);
    const nieomowione = pytania.filter(p => !p.omowione);
    const omowione = pytania.filter(p => p.omowione);

    if (ladowanie) return null;

    return (
      <div style={{ marginTop: '12px' }}>
        {/* Materiały do przyswojenia */}
        <div style={{ background: '#eef4ff', border: '0.5px solid #c5d8f7', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', display: materialy.length === 0 && !czyProwadzacy ? 'none' : 'block' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: '#1565c0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📚 Materiały do przyswojenia przed spotkaniem „na żywo"
          </div>
          {materialy.length === 0 && !czyProwadzacy && (
            <div style={{ fontSize: '12px', color: '#5c85c8', fontStyle: 'italic' }}>Materiały zostaną dodane przez prowadzącego.</div>
          )}
          {materialy.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1565c0', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '13px', color: '#1a1a1a' }}>
                {m.link ? (
                  <a href={m.link} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'none', fontWeight: 600, background: '#1565c0', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    📖 {m.tytul} →
                  </a>
                ) : (
                  <span style={{ fontWeight: 500 }}>{m.tytul}</span>
                )}
              </div>
              {czyProwadzacy && (
                <button onClick={() => usunMaterial(m.id)}
                  style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}>×</button>
              )}
            </div>
          ))}
          {/* Formularz dodawania materiałów (prowadzący/biuro) */}
          {czyProwadzacy && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <input type="text" value={nowyMat.tytul} onChange={e => setNowyMat(v => ({ ...v, tytul: e.target.value }))}
                placeholder="Tytuł materiału *"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dodajMaterial(e as any); } }}
                style={{ flex: 2, minWidth: '140px', fontSize: '12px', padding: '6px 8px', border: '0.5px solid #c5d8f7', borderRadius: '7px', fontFamily: 'Jost, sans-serif' }} />
              <input type="url" value={nowyMat.link} onChange={e => setNowyMat(v => ({ ...v, link: e.target.value }))}
                placeholder="Link (opcjonalnie)"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dodajMaterial(e as any); } }}
                style={{ flex: 2, minWidth: '140px', fontSize: '12px', padding: '6px 8px', border: '0.5px solid #c5d8f7', borderRadius: '7px', fontFamily: 'Jost, sans-serif' }} />
              <button type="button" onClick={dodajMaterial as any} disabled={!nowyMat.tytul.trim()}
                style={{ padding: '6px 12px', background: nowyMat.tytul.trim() ? '#1565c0' : '#ccc', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: nowyMat.tytul.trim() ? 'pointer' : 'default', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                + Dodaj
              </button>
            </div>
          )}
        </div>

        {/* Pytania kursanta (widok kursanta) */}
        {!czyProwadzacy && (
          <div style={{ background: '#fef9ec', border: '0.5px solid #fde68a', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#c8a84b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ❓ Twoje pytania do prowadzącego
            </div>
            {mojePytania.length === 0 && (
              <div style={{ fontSize: '12px', color: '#b48a2a', marginBottom: '8px', fontStyle: 'italic' }}>
                Masz pytania do materiału? Zadaj je tutaj — prowadzący odpowie na zajęciach.
              </div>
            )}
            {mojePytania.map(p => (
              <div key={p.id} style={{ marginBottom: '8px', padding: '8px 10px', background: p.omowione ? '#f0faf4' : 'white', borderRadius: '8px', border: `0.5px solid ${p.omowione ? '#c8e6c9' : '#fde68a'}` }}>
                {edytowanePytanie === p.id ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <textarea value={edytowanaTresc} onChange={e => setEdytowanaTresc(e.target.value)} rows={2}
                      style={{ flex: 1, fontSize: '12px', padding: '5px 8px', border: '0.5px solid #fde68a', borderRadius: '7px', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button onClick={() => zapiszEdycje(p.id)}
                        style={{ padding: '4px 10px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>✓</button>
                      <button onClick={() => setEdytowanePytanie(null)}
                        style={{ padding: '4px 10px', background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{p.tresc}</div>
                      {p.omowione && <div style={{ fontSize: '10px', color: '#2e7d32', marginTop: '3px', fontWeight: 600 }}>✓ Omówione na zajęciach</div>}
                    </div>
                    {!p.omowione && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => { setEdytowanePytanie(p.id); setEdytowanaTresc(p.tresc); }}
                          style={{ fontSize: '10px', padding: '2px 7px', border: '0.5px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Jost, sans-serif' }}>Edytuj</button>
                        <button onClick={() => usunPytanie(p.id)}
                          style={{ fontSize: '10px', padding: '2px 6px', border: 'none', background: 'none', cursor: 'pointer', color: '#e57373' }}>×</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {/* Formularz pytania */}
            {zjazd.status !== 'zakonczony' && (
              <form onSubmit={dodajPytanie} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <textarea value={nowePytanie} onChange={e => setNowePytanie(e.target.value)}
                  placeholder="Wpisz pytanie do prowadzącego…" rows={2} required
                  style={{ flex: 1, fontSize: '12px', padding: '6px 8px', border: '0.5px solid #fde68a', borderRadius: '8px', fontFamily: 'Jost, sans-serif', resize: 'vertical' }} />
                <button type="submit" disabled={!nowePytanie.trim()}
                  style={{ padding: '6px 12px', background: nowePytanie.trim() ? '#c8a84b' : '#ddd', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: nowePytanie.trim() ? 'pointer' : 'default', fontFamily: 'Jost, sans-serif', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
                  Wyślij
                </button>
              </form>
            )}
          </div>
        )}

        {/* Pytania kursantów (widok prowadzącego) */}
        {czyProwadzacy && pytania.length > 0 && (
          <div style={{ background: '#fef9ec', border: '0.5px solid #fde68a', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#c8a84b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ❓ Pytania kursantów ({nieomowione.length} do omówienia{omowione.length > 0 ? `, ${omowione.length} omówionych` : ''})
            </div>
            {nieomowione.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px', background: 'white', borderRadius: '8px', border: '0.5px solid #fde68a', marginBottom: '6px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '2px' }}>{p.imie} {p.nazwisko}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{p.tresc}</div>
                </div>
                <button onClick={() => toggleOmowione(p.id, p.omowione)}
                  style={{ fontSize: '10px', padding: '4px 10px', background: '#e8f5e9', color: '#2e7d32', border: '0.5px solid #c8e6c9', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ✓ Omówione
                </button>
              </div>
            ))}
            {omowione.length > 0 && (
              <details style={{ marginTop: '8px' }}>
                <summary style={{ fontSize: '11px', color: '#2e7d32', cursor: 'pointer', userSelect: 'none' }}>
                  ▾ Omówione ({omowione.length})
                </summary>
                {omowione.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '6px 10px', background: '#f0faf4', borderRadius: '8px', border: '0.5px solid #c8e6c9', marginTop: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#2e7d32', marginBottom: '2px' }}>{p.imie} {p.nazwisko}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.tresc}</div>
                    </div>
                    <button onClick={() => toggleOmowione(p.id, p.omowione)}
                      style={{ fontSize: '10px', padding: '3px 8px', background: 'none', color: 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      ↩ Cofnij
                    </button>
                  </div>
                ))}
              </details>
            )}
          </div>
        )}
        {czyProwadzacy && pytania.length === 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>Brak pytań od kursantów.</div>
        )}
      </div>
    );
  }

  function KalendarzZjazdow({ zjazdy, grupy, zadania, odpowiedziZadan }: { zjazdy: Zjazd[]; grupy?: { id: number; nazwa: string }[]; zadania?: Zadanie[]; odpowiedziZadan?: ZadanieOdpowiedz[] }) {
    const [miesiac, setMiesiac] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const [rok, mies] = miesiac.split('-').map(Number);
    const pierwszyDzien = new Date(rok, mies - 1, 1);
    const liczbaDni = new Date(rok, mies, 0).getDate();
    const startDow = (pierwszyDzien.getDay() + 6) % 7;
    const nazwyMiesiecy = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
    const nazwyDni = ['Pon','Wt','Śr','Czw','Pt','Sob','Nd'];
    const dzisiaj = new Date().toISOString().split('T')[0];

    // Kolory per grupa
    const koloryCykl = ['#a05c5c','#1565c0','#2e7d32','#c8a84b','#6a1b9a','#d84315','#00838f'];
    const grupaKolor: Record<number, string> = {};
    (grupy || []).forEach((g, i) => { grupaKolor[g.id] = koloryCykl[i % koloryCykl.length]; });

    // Mapa dzień → zjazdy
    const mapa: Record<string, { zjazd: Zjazd; dzien: 1 | 2 }[]> = {};
    zjazdy.forEach(z => {
      [z.data_dzien1, z.data_dzien2].forEach((data, idx) => {
        if (!data) return;
        const d = data.substring(0, 10);
        if (!mapa[d]) mapa[d] = [];
        mapa[d].push({ zjazd: z, dzien: (idx + 1) as 1 | 2 });
      });
    });


    // Mapa dzień → zadania z terminem
    const mapaZadan: Record<string, Zadanie[]> = {};
    (zadania || []).forEach(z => {
      if (!z.termin) return;
      const d = z.termin.substring(0, 10);
      if (!mapaZadan[d]) mapaZadan[d] = [];
      mapaZadan[d].push(z);
    });

    const komorki: (number | null)[] = [
      ...Array(startDow).fill(null),
      ...Array.from({ length: liczbaDni }, (_, i) => i + 1),
    ];
    while (komorki.length % 7 !== 0) komorki.push(null);

    return (
      <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid var(--border)', overflow: 'hidden', marginBottom: '16px' }}>
        {/* Nagłówek */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--border)' }}>
          <button onClick={() => { const d = new Date(rok, mies - 2, 1); setMiesiac(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }}
            style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>‹</button>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 400, color: 'var(--brand-dark)' }}>
            {nazwyMiesiecy[mies - 1]} {rok}
          </span>
          <button onClick={() => { const d = new Date(rok, mies, 1); setMiesiac(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }}
            style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>›</button>
        </div>
        {/* Dni tygodnia */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
          {nazwyDni.map(d => (
            <div key={d} style={{ padding: '6px 4px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{d}</div>
          ))}
        </div>
        {/* Siatka */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {komorki.map((dzien, idx) => {
            const dataStr = dzien ? `${rok}-${String(mies).padStart(2,'0')}-${String(dzien).padStart(2,'0')}` : '';
            const wpisy = dataStr ? (mapa[dataStr] || []) : [];
            const czyDzisiaj = dataStr === dzisiaj;
            const czyWeekend = idx % 7 >= 5;
            return (
              <div key={idx} style={{
                minHeight: '64px', padding: '4px 4px 3px',
                borderBottom: '0.5px solid var(--border-soft)',
                borderRight: idx % 7 < 6 ? '0.5px solid var(--border-soft)' : 'none',
                background: !dzien ? '#fafaf9' : czyWeekend ? '#fdf8f7' : 'white',
              }}>
                {dzien && (
                  <>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: czyDzisiaj ? 'var(--brand)' : 'transparent',
                      color: czyDzisiaj ? 'white' : czyWeekend ? 'var(--brand)' : 'var(--text)',
                      fontSize: '11px', fontWeight: czyDzisiaj ? 700 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '2px',
                    }}>{dzien}</div>
                    {wpisy.map((w, i) => {
                      const kolor = grupy ? (grupaKolor[w.zjazd.grupa_id] || 'var(--brand)') : 'var(--brand)';
                      const nazwa = grupy ? grupy.find(g => g.id === w.zjazd.grupa_id)?.nazwa : null;
                      const tooltipTekst = `Zjazd ${w.zjazd.nr} — Dzień ${w.dzien}${nazwa ? '\n' + nazwa : ''}${w.zjazd.tematy ? '\n' + w.zjazd.tematy : ''}`;
                      return (
                        <div key={i}
                          title={tooltipTekst}
                          onClick={e => { e.stopPropagation(); alert(tooltipTekst); }}
                          style={{
                            background: kolor + '20', borderLeft: `2px solid ${kolor}`,
                            borderRadius: '0 3px 3px 0', padding: '1px 4px', marginBottom: '1px',
                            fontSize: '9px', color: kolor, fontWeight: 700, lineHeight: 1.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}>
                          {nazwa ? (nazwa.split(' ').slice(0, 2).join(' ')) : `Zjazd ${w.zjazd.nr}`} D{w.dzien}
                        </div>
                      );
                    })}
                    {/* Terminy zadań */}
                    {(mapaZadan[dataStr] || []).map((z, i) => {
                      const przeslane = (odpowiedziZadan || []).some(o => o.zadanie_id === z.id);
                      const kolor = z.typ === 'praca_zaliczeniowa' ? '#c8a84b' : '#1565c0';
                      const ikona = z.typ === 'praca_zaliczeniowa' ? '⭐' : '📝';
                      const tytulKrotki = z.tytul.length > 10 ? z.tytul.substring(0, 9) + '…' : z.tytul;
                      const tooltipTekst = `${ikona} Termin: ${z.tytul}${przeslane ? '\n✓ Praca przesłana' : '\n⚠ Nie przesłano'}`;
                      return (
                        <div key={`z${i}`}
                          title={tooltipTekst}
                          onClick={e => { e.stopPropagation(); alert(tooltipTekst); }}
                          style={{
                            background: przeslane ? '#e8f5e920' : kolor + '18',
                            borderLeft: `2px solid ${przeslane ? '#2e7d32' : kolor}`,
                            borderRadius: '0 3px 3px 0', padding: '1px 4px', marginBottom: '1px',
                            fontSize: '9px', color: przeslane ? '#2e7d32' : kolor, fontWeight: 700, lineHeight: 1.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}>
                          {ikona} {tytulKrotki}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}
        </div>
        {/* Legenda (tylko gdy wiele grup) */}
        {grupy && grupy.length > 1 && (
          <div style={{ padding: '8px 12px', borderTop: '0.5px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {grupy.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: grupaKolor[g.id] || 'var(--brand)', flexShrink: 0 }} />
                {g.nazwa}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function EkranProfil({ user, kursant, zjazdy, onWyloguj, onAvatarZmieniony, grupaInfo, onOtworzAnkiete, zadania, odpowiedziZadan, pushAktywny, onWlaczPush, onWylaczPush }: { user: User; kursant: Kursant | null; zjazdy: Zjazd[]; onWyloguj: () => void; onAvatarZmieniony: (url: string) => void; grupaInfo: Grupa | null; onOtworzAnkiete: () => void; zadania?: Zadanie[]; odpowiedziZadan?: ZadanieOdpowiedz[]; pushAktywny: boolean; onWlaczPush: () => void; onWylaczPush: () => void }) {
    const [uploadowanie, setUploadowanie] = useState(false);
    const [pokazKalendarz, setPokazKalendarz] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
  
    const SERIF = "'Cormorant Garamond', Georgia, serif";
    const inicjal = kursant ? kursant.imie[0] : user.email[0].toUpperCase();
    const nazwaGrupy = kursant?.grupy?.nazwa || '—';
    const miasto = kursant?.grupy?.miasto || '';
    const edycja = kursant?.grupy?.edycja || '';
    const wszystkieZjazdy = zjazdy.length;
    const zakonczone = zjazdy.filter(z => z.status === 'zakonczony').length;
    const procent = wszystkieZjazdy > 0 ? Math.round((zakonczone / wszystkieZjazdy) * 100) : 0;
    const ostatniZjazd = zjazdy.length > 0 ? zjazdy[zjazdy.length - 1] : null;
    const ankietaDostepna = ostatniZjazd?.status === 'zakonczony';
    const zadaniaDomowe = (zadania || []).filter(z => z.typ !== 'praca_zaliczeniowa');
    const wyslaneZadania = (odpowiedziZadan || []).filter(o => zadaniaDomowe.some(z => z.id === o.zadanie_id)).length;
    const procent_r = 32;
  const circ_unused = procent_r;
  void circ_unused;
  
    async function wgrajZdjecie(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]; if (!file) return;
      setUploadowanie(true);
      const ext = file.name.split('.').pop();
      const path = `${user.id}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) { alert('Błąd: ' + error.message); setUploadowanie(false); return; }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('kursanci').update({ avatar_url: data.publicUrl }).eq('user_id', user.id);
      onAvatarZmieniony(data.publicUrl);
      setUploadowanie(false);
    }
  
    return (
      <>
        {/* ── HERO ── */}
        <div style={{ margin: '-18px -16px 0', background: 'linear-gradient(180deg, #1C2B3A 0%, #2a3d50 100%)', padding: '32px 24px 28px', position: 'relative', overflow: 'hidden' }}>
          {/* Dekoracja */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
  
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              {kursant?.avatar_url
                ? <img src={kursant.avatar_url} alt="avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                : <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: '28px', color: 'white', border: '2px solid rgba(255,255,255,0.2)' }}>{inicjal.toUpperCase()}</div>
              }
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#c8a84b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1C2B3A' }}>
                {uploadowanie
                  ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid white', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                }
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={wgrajZdjecie} style={{ display: 'none' }} />
  
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '26px', color: 'white', lineHeight: 1.1, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {kursant ? `${kursant.imie} ${kursant.nazwisko}` : user.email}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nazwaGrupy}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {miasto && <span style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '3px 8px', borderRadius: '999px' }}>📍 {miasto}</span>}
                {edycja && <span style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(200,168,75,0.25)', color: '#c8a84b', padding: '3px 8px', borderRadius: '999px' }}>{edycja}</span>}
              </div>
            </div>
          </div>
  
          {/* Statystyki */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '22px' }}>
            {[
              { label: 'Zjazdy', value: `${zakonczone}/${wszystkieZjazdy}`, sub: 'ukończone' },
              { label: 'Postęp', value: `${procent}%`, sub: 'kursu' },
              { label: 'Zadania', value: `${wyslaneZadania}/${zadaniaDomowe.length}`, sub: 'przesłane' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '22px', color: 'white', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '8.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
  
        {/* ── PASEK POSTĘPU ── */}
        <div style={{ background: 'white', padding: '14px 18px', borderBottom: '0.5px solid var(--border)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {zakonczone === 0 ? 'Kurs jeszcze nie rozpoczęty' : zakonczone === wszystkieZjazdy ? '🎉 Kurs ukończony!' : `${zakonczone} z ${wszystkieZjazdy} zjazdów`}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 600 }}>{procent}%</span>
          </div>
          <div style={{ height: '4px', background: '#f0ece7', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${procent}%`, background: 'linear-gradient(90deg, #AD6B68, #B35758)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
  
        {/* ── KARTY AKCJI ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
  
          {/* Strefa Wiedzy */}
          {grupaInfo?.drive_link && (
            <a href={grupaInfo.drive_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '1px' }}>Strefa Wiedzy</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Materiały grupy · Google Drive</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
              </div>
            </a>
          )}
  
          {/* Certyfikat */}
          {kursant?.folder_prywatny && (
            <a href={kursant.folder_prywatny} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '1px' }}>Folder prywatny</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dokumenty poufne · umowy, prace zaliczeniowe</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
              </div>
            </a>
          )}
          {kursant?.certyfikat_url ? (
            <a href={kursant.certyfikat_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, #fdf6e8 0%, #fef9f0 100%)', borderRadius: '16px', padding: '14px 16px', border: '0.5px solid #e8d4a0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#c8a84b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#2a1f1f', marginBottom: '1px' }}>Certyfikat ukończenia</div>
                  <div style={{ fontSize: '11px', color: '#a07830' }}>Kliknij aby pobrać / wyświetlić</div>
                </div>
                <span style={{ color: '#c8a84b', fontSize: '18px' }}>›</span>
              </div>
            </a>
          ) : (
            <div style={{ background: '#fafafa', borderRadius: '16px', padding: '14px 16px', border: '0.5px dashed #d0d0d0', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.6 }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#aaa', marginBottom: '1px' }}>Certyfikat ukończenia</div>
                <div style={{ fontSize: '11px', color: '#bbb' }}>Dostępny po zakończeniu kursu</div>
              </div>
            </div>
          )}
  
          {/* Ankieta */}
          {ankietaDostepna ? (
            <div onClick={onOtworzAnkiete} style={{ background: 'var(--brand-dark)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '1px' }}>Ankieta oceny kursu</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Twoja opinia jest dla nas ważna</div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>›</span>
            </div>
          ) : (
            <div style={{ background: '#fafafa', borderRadius: '16px', padding: '14px 16px', border: '0.5px dashed #d0d0d0', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.6 }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#aaa', marginBottom: '1px' }}>Ankieta oceny kursu</div>
                <div style={{ fontSize: '11px', color: '#bbb' }}>Odblokuje się po ostatnim zjeździe</div>
              </div>
            </div>
          )}
  
          {/* Push */}
          <div onClick={pushAktywny ? onWylaczPush : onWlaczPush} style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: pushAktywny ? '#e8f5e9' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pushAktywny ? '#2e7d32' : '#999'} strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '1px' }}>Powiadomienia push</div>
              <div style={{ fontSize: '11px', color: pushAktywny ? '#2e7d32' : 'var(--text-muted)' }}>{pushAktywny ? '✓ Włączone' : 'Wyłączone — kliknij aby włączyć'}</div>
            </div>
            <div style={{ width: '36px', height: '20px', borderRadius: '999px', background: pushAktywny ? '#2e7d32' : '#ddd', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '2px', left: pushAktywny ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
  
          {/* Email */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '1px' }}>Adres e-mail</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
        </div>
  
        {/* ── KALENDARZ ── */}
        {zjazdy.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <button onClick={() => setPokazKalendarz(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 2px', marginBottom: pokazKalendarz ? '10px' : 0, fontFamily: 'inherit' }}>
              <span style={{ fontSize: '9.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>📅 Mój harmonogram</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-block', transform: pokazKalendarz ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>▾</span>
            </button>
            {pokazKalendarz && <KalendarzZjazdow zjazdy={zjazdy} zadania={zadania} odpowiedziZadan={odpowiedziZadan} />}
          </div>
        )}
  
        {/* ── WYLOGUJ ── */}
        <button onClick={onWyloguj} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '0.5px solid var(--border)', background: 'white', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Wyloguj się
        </button>
  
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>ON-ARCH · STUDENT APP</span>
        </div>
      </>
    );
  }
  async function wyslijPush(supabase: any, params: { user_id?: string; grupa_id?: number; title: string; body: string; url?: string }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const result = await fetch('https://bksebyxrknubyokwuaby.supabase.co/functions/v1/rapid-responder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrc2VieXhya251Ynlva3d1YWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjkxMzMsImV4cCI6MjA1ODQwNTEzM30.PzMGHJC8Fo0FqfUPXnAUy7-FYSbqQrjGBpvFLKkwb0s',
        },
        body: JSON.stringify(params),
      });
      await result.json();
    } catch (e) {
      console.error('Push error:', e);
    }
  }
  export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [kursant, setKursant] = useState<Kursant | null>(null);
    const [grupaInfo, setGrupaInfo] = useState<Grupa | null>(null);
    const [aktywnaZakladka, setAktywnaZakladka] = useState(() => localStorage.getItem('aktywna_zakladka') || 'home');
    const [aktywneOgloszenie, setAktywneOgloszenie] = useState<Ogloszenie | null>(null);
    const [pokazAnkiete, setPokazAnkiete] = useState(false);
    const [ogloszenia, setOgloszenia] = useState<Ogloszenie[]>([]);
    const [zjazdy, setZjazdy] = useState<Zjazd[]>([]);
    const [zadania, setZadania] = useState<Zadanie[]>([]);
    const [odpowiedziZadan, setOdpowiedziZadan] = useState<ZadanieOdpowiedz[]>([]);
    const [noweCzat, setNoweCzat] = useState(false);
    const [pushAktywny, setPushAktywny] = useState(false);

useEffect(() => {
  if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
  navigator.serviceWorker.register('/sw.js').then(async reg => {
    const sub = await reg.pushManager.getSubscription();
    if (sub) setPushAktywny(true);
  });
}, [user]);

async function wlaczPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Twoja przeglądarka nie obsługuje powiadomień push.');
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  const subJson = sub.toJSON();
  await supabase.from('push_subscriptions').upsert([{
    user_id: user!.id,
    endpoint: subJson.endpoint!,
    p256dh: subJson.keys!.p256dh,
    auth: subJson.keys!.auth,
  }], { onConflict: 'user_id,endpoint' });
  setPushAktywny(true);
}

async function wylaczPush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    await supabase.from('push_subscriptions').delete()
      .eq('user_id', user!.id).eq('endpoint', sub.endpoint);
  }
  setPushAktywny(false);
}
    const [ladowanie, setLadowanie] = useState(true);
    const [resetMode, setResetMode] = useState(false);

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
        setLadowanie(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') setResetMode(true);
        // Nowy kursant aktywujący konto przez link — pokaż ekran ustawienia hasła
        if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'email') {
          const lastSignIn = session.user.last_sign_in_at;
          const created = session.user.created_at;
          // Jeśli to pierwsze logowanie (created = last_sign_in), pokaż ekran ustawienia hasła
          if (lastSignIn && created && Math.abs(new Date(lastSignIn).getTime() - new Date(created).getTime()) < 5000) {
            setResetMode(true);
          }
        }
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

        const { data: kursantData } = await supabase.from('kursanci').select('imie, nazwisko, grupa_id, rola, avatar_url, certyfikat_url, onboarding_done, folder_prywatny').eq('user_id', user!.id).single();
        let grupaData = null;
        if (kursantData?.grupa_id) {
          const { data } = await supabase.from('grupy').select('id, nazwa, miasto, edycja, drive_link, link_materialow, link_nagran').eq('id', kursantData.grupa_id).single();
          grupaData = data;
          setGrupaInfo(data as Grupa | null);
        }
        setKursant(kursantData ? { ...kursantData, grupy: grupaData } as Kursant : null);
        await aktualizujStatusyZjazdow();
        const grupaId = kursantData?.grupa_id;
        const [{ data: og }, { data: zj }] = await Promise.all([
          supabase.from('ogloszenia').select('*').order('data_utworzenia', { ascending: false }),
          grupaId
            ? supabase.from('zjazdy').select('*').eq('grupa_id', grupaId).order('data_zjazdu', { ascending: true })
            : Promise.resolve({ data: [] }),  // brak grupy = brak zjazdów, nigdy nie pobieraj wszystkich
        ]);
        setOgloszenia((og || []).filter((o: any) => o.grupa_id === null || o.grupa_id === grupaId).map((o: any) => {
          // Sprawdź lokalnie czy kursant już czytał to ogłoszenie
          const klucz = `ogl_read_${user!.id}`;
          const przeczytane: string[] = JSON.parse(localStorage.getItem(klucz) || '[]');
          return przeczytane.includes(String(o.id)) ? { ...o, nowe: false } : o;
        }));

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
        setZjazdy((zj || []).map((z: any) => ({
          ...z,
          status: przeliczStatus(z),
          prowadzacy: prowadzacyMap[z.id] || [],
        })));

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
      // Status przeliczany na żywo przy fetchowaniu — nie zapisujemy do bazy
      return;
    }

    // Status przeliczany na żywo — patrz przeliczStatus() na poziomie modułu

    async function wyloguj() {
      await supabase.auth.signOut();
      setUser(null); setKursant(null); setResetMode(false);
    }

    async function otworzOgloszenie(o: Ogloszenie) {
      setAktywneOgloszenie(o);
      if (o.nowe) {
        const klucz = `ogl_read_${user?.id}`;
        const przeczytane: string[] = JSON.parse(localStorage.getItem(klucz) || '[]');
        if (!przeczytane.includes(String(o.id))) {
          przeczytane.push(String(o.id));
          localStorage.setItem(klucz, JSON.stringify(przeczytane));
        }
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
      localStorage.setItem('aktywna_zakladka', zakl);
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
    if (kursant?.rola === 'admin') return <PanelBiura onWyloguj={wyloguj} user={user} />;
    if (kursant?.rola === 'prowadzacy') return <PanelProwadzacego user={user} kursant={kursant} onWyloguj={wyloguj} />;
    if (kursant && !kursant.onboarding_done) return <EkranPowitalny kursant={kursant} user={user} onDalej={() => setKursant(prev => prev ? { ...prev, onboarding_done: true } : prev)} />;

    return (
      <div className="app">
        <header className="header" style={{ position: 'static', ...(aktywnaZakladka === 'home' && !aktywneOgloszenie && !pokazAnkiete ? { display: 'none' } : {}) }}>
          <OnArchLogo height={22} color="var(--brand-dark)" />
          {avatarUrl ? <img src={avatarUrl} alt="avatar" className="avatar-img" /> : <div className="avatar">{inicjal.toUpperCase()}</div>}
        </header>
       <div className="app-body">
        <main className="main" style={aktywnaZakladka === 'czat' ? { padding: 0, overflow: 'hidden' } : {}}>
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
                user={user} kursant={kursant}
                onNavigate={nawiguj}
                zadania={zadania}
                odpowiedzi={odpowiedziZadan}
                  grupaInfo={grupaInfo}
                />
              )}
              {aktywnaZakladka === 'zjazdy' && <EkranZjazdy zjazdy={zjazdy} user={user} kursant={kursant} grupaInfo={grupaInfo} />}
              {aktywnaZakladka === 'ogloszenia' && <EkranOgloszenia ogloszenia={ogloszenia} onOtworzOgloszenie={otworzOgloszenie} />}
              {aktywnaZakladka === 'zadania' && <EkranZadania user={user} kursant={kursant} />}
              {aktywnaZakladka === 'czat' && <EkranCzat user={user} kursant={kursant} />}
              {aktywnaZakladka === 'materialy' && <EkranMaterialy />}
              {aktywnaZakladka === 'profil' && (
                <EkranProfil
                  user={user} kursant={kursant} zjazdy={zjazdy}
                  onWyloguj={wyloguj} onAvatarZmieniony={onAvatarZmieniony}
                  grupaInfo={grupaInfo}
                  zadania={zadania}
                  odpowiedziZadan={odpowiedziZadan}
                  onOtworzAnkiete={() => setPokazAnkiete(true)}
                  pushAktywny={pushAktywny}
                  onWlaczPush={wlaczPush}
                  onWylaczPush={wylaczPush}
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
      </div>
    );
  }