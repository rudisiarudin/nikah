import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Link as LinkIcon, MessageSquare, Copy, LogOut, CheckCircle2, ChevronRight, X } from 'lucide-react';

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
  const [customMessage, setCustomMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Wishes State
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: string]: boolean }>({});

  // Guest Tracker State
  const [invitedGuests, setInvitedGuests] = useState<any[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);

  const fetchGuests = async () => {
    try {
      setIsLoadingGuests(true);
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setInvitedGuests(data);
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setIsLoadingGuests(false);
    }
  };

  const addToTracker = async (name: string, url: string, cat: string) => {
    if (!name || !url) return;
    
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{ name, url, category: cat }])
        .select();

      if (error) throw error;
      if (data) setInvitedGuests([data[0], ...invitedGuests]);
    } catch (err) {
      console.error('Error adding guest:', err);
    }
  };

  const removeGuest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInvitedGuests(invitedGuests.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error removing guest:', err);
    }
  };

  const clearAllGuests = async () => {
    if(!confirm('Hapus semua riwayat di database?')) return;
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      setInvitedGuests([]);
    } catch (err) {
      console.error('Error clearing guests:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_passcode')
        .single();

      if (fetchError) throw fetchError;

      if (data && passcode === data.value) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
      } else {
        setError('Password salah');
      }
    } catch (err) {
      console.error('Error authenticating:', err);
      setError('Gagal memvalidasi passcode. Pastikan tabel settings sudah dibuat.');
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
    addToTracker(guestName, generatedUrl, category);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!generatedUrl || !guestName) return;

    let text = customMessage;
    if (!text) {
      if (category === 'muslim') {
        text = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nKepada Yth. ${guestName},\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.\n\nBerikut link undangan kami untuk info selengkapnya:\n${generatedUrl}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`;
      } else {
        text = `Kepada Yth. ${guestName},\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.\n\nBerikut link undangan kami untuk info selengkapnya:\n${generatedUrl}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.\n\nTerima Kasih.`;
      }
    } else {
      // Replace placeholders
      text = text.replace(/{nama}/g, guestName).replace(/{url}/g, generatedUrl);
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
    if (isAuthenticated) {
      if (activeTab === 'wishes') {
        fetchWishes();
      } else if (activeTab === 'url') {
        fetchGuests();
      }
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
          className="bg-white/80 backdrop-blur-md p-8 rounded-[10px] shadow-xl w-full max-w-sm border border-primary/10"
        >
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={24} />
          </div>
          <h1 className="italiana-font text-3xl text-center text-primary mb-2">Admin Login</h1>
          <p className="text-center text-[13px] text-primary/60 mb-8 outfit-font">Silakan masukkan passcode untuk masuk.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode"
                className="w-full bg-white border border-primary/10 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-center tracking-widest"
              />
              {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-primary text-neutral py-3.5 rounded-[12px] text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
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
    <div className="min-h-screen bg-[#F9F8F4] text-primary outfit-font relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-texture opacity-[0.05] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="italiana-font text-2xl text-primary flex items-center gap-2">
              <span className="font-normal text-[#7c6d52]">Admin</span> Dashboard
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
        {/* Tabs - Scrollable on mobile */}
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 mb-8 bg-white/50 p-1.5 rounded-[12px] border border-primary/5 w-fit min-w-full sm:min-w-0">
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 sm:px-6 py-2.5 rounded-[10px] text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'url' ? 'bg-primary text-neutral shadow-lg shadow-primary/20' : 'text-primary/60 hover:text-primary hover:bg-white/80'}`}
            >
              <LinkIcon size={16} /> Buat URL
            </button>
            <button
              onClick={() => setActiveTab('wishes')}
              className={`px-4 sm:px-6 py-2.5 rounded-[10px] text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'wishes' ? 'bg-primary text-neutral shadow-lg shadow-primary/20' : 'text-primary/60 hover:text-primary hover:bg-white/80'}`}
            >
              <MessageSquare size={16} /> Kelola Ucapan
            </button>
          </div>
        </div>

        {/* URL Generator Content */}
        {activeTab === 'url' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-primary/10 rounded-[20px] p-6 md:p-10 shadow-sm">
                <h2 className="italiana-font text-2xl mb-2">Buat URL Undangan</h2>
                <p className="text-sm text-primary/60 mb-8">Ketikkan nama tamu untuk menghasilkan link khusus untuk mereka.</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40 block outfit-font">Nama Tamu</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Misal: Joko Widodo"
                        className="w-full bg-[#F9F8F4] border border-primary/10 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40 block outfit-font">Kategori Ucapan</label>
                      <div className="flex bg-[#F9F8F4] border border-primary/10 rounded-[12px] p-1.5 w-full font-medium">
                        <button
                          onClick={() => setCategory('muslim')}
                          className={`flex-1 py-2 rounded-[10px] text-xs transition-all duration-300 ${category === 'muslim' ? 'bg-white shadow-sm text-primary font-bold' : 'text-primary/40 hover:text-primary'}`}
                        >
                          Muslim
                        </button>
                        <button
                          onClick={() => setCategory('umum')}
                          className={`flex-1 py-2 rounded-[10px] text-xs transition-all duration-300 ${category === 'umum' ? 'bg-white shadow-sm text-primary font-bold' : 'text-primary/40 hover:text-primary'}`}
                        >
                          Umum
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40 block outfit-font">Custom Pesan WhatsApp (Opsional)</label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Gunakan {nama} dan {url} sebagai penanda posisi..."
                      rows={4}
                      className="w-full bg-[#F9F8F4] border border-primary/10 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all font-medium resize-none"
                    />
                    <p className="text-[10px] text-primary/30 italic italic">Kosongkan untuk menggunakan template standar.</p>
                  </div>

                  <AnimatePresence>
                    {generatedUrl && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4 border-t border-primary/5">
                        <div className="p-4 bg-primary/5 rounded-xl border border-dashed border-primary/20 break-all text-sm font-medium text-primary text-center">
                          {generatedUrl}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleCopyUrl}
                            className="flex-1 bg-white border border-primary/20 text-primary py-3.5 rounded-[12px] text-[10px] font-bold tracking-widest uppercase hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                          >
                            {copiedUrl ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                            {copiedUrl ? 'Tersalin!' : 'Salin URL'}
                          </button>
                          <button
                            onClick={handleWhatsAppShare}
                            className="flex-1 bg-[#25D366] text-white py-3.5 rounded-[12px] text-[10px] font-bold tracking-widest uppercase hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
                          >
                            <MessageSquare size={16} />
                            Kirim via WA
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Live Preview Column */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white border border-primary/10 rounded-[20px] p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="italiana-font text-xl">Preview Undangan</h3>
                  <div className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Mobile View</div>
                </div>
                <div className="aspect-[9/16] max-w-[280px] mx-auto bg-neutral rounded-[20px] border-4 border-primary/5 overflow-hidden relative shadow-inner">
                  {guestName ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#F9F8F4] text-center">
                       <div className="absolute inset-0 bg-texture opacity-10" />
                       <p className="outfit-font text-[8px] uppercase tracking-[0.4em] mb-4 text-primary/40">The Wedding of</p>
                       <h4 className="italiana-font text-3xl mb-8">Ayu & Rudi</h4>
                       <div className="w-12 h-px bg-[#7c6d52]/30 mb-8" />
                       <p className="serif-font text-[10px] italic text-primary/60 mb-2">Kepada Yth:</p>
                       <p className="outfit-font text-lg font-bold text-[#7c6d52]">{guestName}</p>
                       <div className="mt-12 w-full px-4">
                         <div className="h-10 bg-primary/10 rounded-full w-full animate-pulse" />
                       </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-primary/30">
                      <Lock size={32} className="mb-4 opacity-20" />
                      <p className="text-xs">Masukkan nama tamu untuk melihat preview</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Guest Tracker List (Always visible under URL generator) */}
        {activeTab === 'url' && invitedGuests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="italiana-font text-2xl text-primary">Riwayat Undangan</h3>
              <button 
                onClick={clearAllGuests}
                className="text-[10px] font-bold text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="bg-white border border-primary/10 rounded-[20px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                {isLoadingGuests ? (
                  <div className="py-12 text-center text-primary/40 text-xs">Memuat riwayat...</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary/5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">
                        <th className="px-6 py-4">Nama Tamu</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Waktu Dibuat</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {invitedGuests.map((guest) => (
                        <tr key={guest.id} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-primary">{guest.name}</p>
                            <p className="text-[10px] text-primary/40 truncate max-w-[200px] mt-0.5">{guest.url}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${guest.category === 'muslim' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                              {guest.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] text-primary/60 outfit-font">
                            {new Date(guest.created_at).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(guest.url);
                                  alert('URL disalin!');
                                }}
                                className="w-8 h-8 rounded-full bg-primary/5 text-primary/40 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
                                title="Salin URL"
                              >
                                <Copy size={14} />
                              </button>
                              <button 
                                onClick={() => removeGuest(guest.id)}
                                className="w-8 h-8 rounded-full bg-red-50 text-red-300 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all"
                                title="Hapus"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Wishes Content */}
        {activeTab === 'wishes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Summary Cards */}
            {!isLoadingWishes && wishes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                {[
                  { label: 'Total Ucapan', value: wishes.length, color: 'primary' },
                  { label: 'Hadir', value: wishes.filter(w => w.status === 'Hadir').length, color: 'green-600' },
                  { label: 'Absen', value: wishes.filter(w => w.status === 'Tidak Hadir').length, color: 'red-500' },
                  { label: 'Ragu', value: wishes.filter(w => w.status === 'Masih Ragu').length, color: 'gray-500' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-primary/10 rounded-[10px] p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1 outfit-font">{stat.label}</p>
                    <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white border border-primary/10 rounded-[10px] p-6 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="italiana-font text-2xl mb-1">Daftar Ucapan</h2>
                <p className="text-sm text-primary/60">Kelola dan balas ucapan yang dikirimkan oleh para tamu.</p>
              </div>
              <button 
                onClick={fetchWishes} 
                className="text-xs border border-primary/20 px-4 py-2 rounded-[10px] hover:bg-primary/5 transition-colors font-medium flex items-center gap-2"
              >
                Refresh
              </button>
            </div>

            {isLoadingWishes ? (
              <div className="py-20 text-center text-primary/40 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                Memuat data...
              </div>
            ) : wishes.length === 0 ? (
              <div className="py-20 text-center text-primary/40 bg-white rounded-[10px] border border-primary/5">
                Belum ada ucapan yang masuk.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishes.map((wish) => (
                  <div key={wish.id} className="bg-white border border-primary/10 rounded-[10px] p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{wish.name}</h3>
                        <p className="text-[10px] text-primary/40 font-bold uppercase tracking-[0.2em] outfit-font">{new Date(wish.created_at).toLocaleString('id-ID')}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex-shrink-0 ml-2 ${wish.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                        wish.status === 'Tidak Hadir' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {wish.status === 'Hadir' ? 'Hadir' : wish.status === 'Tidak Hadir' ? 'Absen' : 'Ragu'}
                      </span>
                    </div>
                    <div className="bg-neutral p-4 rounded-[10px] text-sm italic serif-font text-primary/80 mb-6 flex-1">
                      "{wish.message}"
                    </div>

                    <div className="mt-auto space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/40 flex justify-between items-center outfit-font">
                        Balasan Mempelai
                        {wish.reply && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Sudah dibalas</span>}
                      </label>
                      <textarea
                        value={replyText[wish.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [wish.id]: e.target.value })}
                        placeholder="Tulis balasan untuk ucapan ini..."
                        rows={2}
                        className="w-full bg-white border border-primary/10 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:border-primary/40 transition-all font-medium resize-none shadow-sm"
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
