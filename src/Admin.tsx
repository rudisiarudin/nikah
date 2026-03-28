import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Link as LinkIcon, MessageSquare, Copy, LogOut, CheckCircle2, ChevronRight, X } from 'lucide-react';

const ADMIN_PASSCODE = '021022';
const BASE_URL = window.location.origin;

interface Wish {
  id: string;
  name: string;
  message: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Masih Ragu';
  created_at: string;
  reply: string | null;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'url' | 'wishes'>('url');

  // URL Generator State
  const [guestName, setGuestName] = useState('');
  const [category, setCategory] = useState<'muslim' | 'umum'>('muslim');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Wishes State
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: string]: boolean }>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Password salah');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPasscode('');
  };

  const currentUrl = guestName
    ? `${BASE_URL}/?to=${encodeURIComponent(guestName)}`
    : '';

  useEffect(() => {
    setGeneratedUrl(currentUrl);
  }, [guestName, currentUrl]);

  const handleCopyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!generatedUrl || !guestName) return;

    let text = '';
    if (category === 'muslim') {
      text = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nKepada Yth. ${guestName},\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.\n\nBerikut link undangan kami untuk info selengkapnya:\n${generatedUrl}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    } else {
      text = `Kepada Yth. ${guestName},\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.\n\nBerikut link undangan kami untuk info selengkapnya:\n${generatedUrl}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.\n\nTerima Kasih.`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fetchWishes = async () => {
    try {
      setIsLoadingWishes(true);
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setWishes(data as Wish[]);
        // Initialize reply text state with existing replies
        const replyState: { [key: string]: string } = {};
        data.forEach((w: any) => {
          if (w.reply) replyState[w.id] = w.reply;
        });
        setReplyText(replyState);
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
    } finally {
      setIsLoadingWishes(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'wishes') {
      fetchWishes();
    }
  }, [isAuthenticated, activeTab]);

  const handleReplySubmit = async (wishId: string) => {
    const reply = replyText[wishId];
    if (reply === undefined) return;

    try {
      setIsSubmittingReply(prev => ({ ...prev, [wishId]: true }));
      const { error } = await supabase
        .from('wishes')
        .update({ reply })
        .eq('id', wishId);

      if (error) throw error;

      // Update local state
      setWishes(wishes.map(w => w.id === wishId ? { ...w, reply } : w));
      alert('Balasan berhasil disimpan!');
    } catch (err) {
      console.error('Error updating reply:', err);
      alert('Gagal menyimpan balasan.');
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [wishId]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-xl w-full max-w-sm border border-primary/10"
        >
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={24} />
          </div>
          <h1 className="italiana-font text-3xl text-center text-primary mb-2">Admin Login</h1>
          <p className="text-center text-sm text-primary/60 mb-8 sans-font">Silakan masukkan passcode untuk masuk.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode"
                className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-center tracking-widest"
              />
              {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-primary text-neutral py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              Masuk
            </button>
            <div className="pt-4 text-center">
              <a href="/" className="text-xs text-primary/40 hover:text-primary transition-colors inline-block pb-1 border-b border-primary/20">Kembali ke Undangan</a>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral text-primary sans-font">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="italiana-font text-xl text-primary flex items-center gap-2">
              <span className="font-bold">Admin</span> Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <a href="/" target="_blank" className="text-xs text-primary/60 hover:text-primary flex items-center gap-1">
                Lihat Undangan <ChevronRight size={14} />
              </a>
              <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl border border-primary/5 w-fit">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'url' ? 'bg-primary text-neutral shadow-md' : 'text-primary/60 hover:text-primary hover:bg-white/80'}`}
          >
            <LinkIcon size={16} /> Buat URL
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'wishes' ? 'bg-primary text-neutral shadow-md' : 'text-primary/60 hover:text-primary hover:bg-white/80'}`}
          >
            <MessageSquare size={16} /> Kelola Ucapan
          </button>
        </div>

        {/* URL Generator Content */}
        {activeTab === 'url' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-primary/10 rounded-[2rem] p-6 md:p-10 shadow-sm max-w-2xl">
            <h2 className="italiana-font text-2xl mb-2">Buat URL Undangan</h2>
            <p className="text-sm text-primary/60 mb-8">Ketikkan nama tamu untuk menghasilkan link khusus untuk mereka. Nama ini akan muncul di halaman depan saat mereka membuka undangan.</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-primary/40 block">Nama Tamu</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Misal: Joko Widodo"
                  className="w-full bg-neutral border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-primary/40 block">Kategori Ucapan</label>
                <div className="flex bg-neutral border border-primary/10 rounded-xl p-1.5 w-full font-medium sm:max-w-xs">
                  <button
                    onClick={() => setCategory('muslim')}
                    className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-300 ${category === 'muslim' ? 'bg-white shadow-sm text-primary font-bold' : 'text-primary/40 hover:text-primary'}`}
                  >
                    Muslim
                  </button>
                  <button
                    onClick={() => setCategory('umum')}
                    className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-300 ${category === 'umum' ? 'bg-white shadow-sm text-primary font-bold' : 'text-primary/40 hover:text-primary'}`}
                  >
                    Umum
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {generatedUrl && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4">
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 break-all text-sm font-medium text-primary">
                      {generatedUrl}
                    </div>

                    <div className="flex gap-3 grid-cols-2">
                      <button
                        onClick={handleCopyUrl}
                        className="flex-1 bg-white border border-primary/20 text-primary py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                      >
                        {copiedUrl ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copiedUrl ? 'Tersalin!' : 'Salin URL'}
                      </button>
                      <button
                        onClick={handleWhatsAppShare}
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
                      >
                        <MessageSquare size={16} />
                        Kirim via WA
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Wishes Content */}
        {activeTab === 'wishes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="italiana-font text-2xl mb-1">Daftar Ucapan</h2>
                <p className="text-sm text-primary/60">Kelola dan balas ucapan yang dikirimkan oleh para tamu.</p>
              </div>
              <button onClick={fetchWishes} className="text-xs border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors font-medium">Refresh</button>
            </div>

            {isLoadingWishes ? (
              <div className="py-20 text-center text-primary/40 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                Memuat data...
              </div>
            ) : wishes.length === 0 ? (
              <div className="py-20 text-center text-primary/40 bg-white rounded-2xl border border-primary/5">
                Belum ada ucapan yang masuk.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishes.map((wish) => (
                  <div key={wish.id} className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{wish.name}</h3>
                        <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">{new Date(wish.created_at).toLocaleString('id-ID')}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex-shrink-0 ml-2 ${wish.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                        wish.status === 'Tidak Hadir' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {wish.status === 'Hadir' ? 'Hadir' : wish.status === 'Tidak Hadir' ? 'Absen' : 'Ragu'}
                      </span>
                    </div>
                    <div className="bg-neutral p-4 rounded-xl text-sm italic serif-font text-primary/80 mb-6 flex-1">
                      "{wish.message}"
                    </div>

                    <div className="mt-auto space-y-3">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-primary/40 flex justify-between items-center">
                        Balasan Mempelai
                        {wish.reply && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Sudah dibalas</span>}
                      </label>
                      <textarea
                        value={replyText[wish.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [wish.id]: e.target.value })}
                        placeholder="Tulis balasan untuk ucapan ini..."
                        rows={2}
                        className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all font-medium resize-none shadow-sm"
                      />
                      <button
                        onClick={() => handleReplySubmit(wish.id)}
                        disabled={isSubmittingReply[wish.id]}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md ${(replyText[wish.id] && replyText[wish.id] !== wish.reply)
                          ? 'bg-primary text-neutral hover:bg-primary/90 shadow-primary/20'
                          : 'bg-primary/10 text-primary/40 hover:bg-primary/20 shadow-none'
                          }`}
                      >
                        {isSubmittingReply[wish.id] ? 'Menyimpan...' : 'Simpan Balasan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
