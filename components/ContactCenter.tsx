
import React, { useState, useCallback } from 'react';
import { useApp } from '../store';
import { 
  ChevronLeft, 
  MessageSquare, 
  Handshake, 
  BarChart3, 
  Send, 
  Loader2,
  Mail,
  Shield,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { triggerHaptic } from '../utils';
import { useHoldToConfirm } from '../hooks/useHoldToConfirm';

type ContactCategory = 'SUPPORT' | 'PARTNER' | 'INVESTOR';

export const ContactCenter: React.FC = () => {
  const { state, setView, submitFeedback, addToast } = useApp();
  const [category, setCategory] = useState<ContactCategory>('SUPPORT');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerUrl, setPartnerUrl] = useState('');
  
  // Honeypot field - should remain empty
  const [website, setWebsite] = useState('');

  const handleBack = () => {
    triggerHaptic('light');
    if (!state.isInitialized) {
      setView('DASHBOARD');
    } else {
      setView('SETTINGS');
    }
  };

  const handleDispatch = useCallback(async () => {
    // 1. Check honeypot
    if (website) {
      console.warn("Spam detected via honeypot.");
      return;
    }

    if (!comment) return;
    
    setIsSubmitting(true);
    triggerHaptic('heavy');
    
    let payload = comment;
    if (category === 'PARTNER') {
      payload = `[PARTNER INQUIRY]\nProject: ${partnerName}\nURL: ${partnerUrl}\nMessage: ${comment}`;
    } else if (category === 'INVESTOR') {
      payload = `[GROWTH PARTNER]\nMessage: ${comment}`;
    }

    const success = await submitFeedback(payload, email, category);
    if (success) {
      addToast("Message Sent Successfully", "SUCCESS");
      setComment('');
      setEmail('');
      setPartnerName('');
      setPartnerUrl('');
      
      setTimeout(() => {
        if (!state.isInitialized) {
          setView('DASHBOARD');
        } else {
          setView('SETTINGS');
        }
      }, 1500);
    }
    setIsSubmitting(false);
  }, [website, comment, category, partnerName, partnerUrl, email, submitFeedback, addToast, state.isInitialized, setView]);

  const { holdProgress, handleStart, handleEnd } = useHoldToConfirm(handleDispatch, 1500);

  const CategoryTab = ({ id, icon: Icon, label }: { id: ContactCategory, icon: any, label: string }) => (
    <button 
      onClick={() => { triggerHaptic('light'); setCategory(id); }}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 border ${
        category === id ? 'bg-theme-main border-theme-primary text-theme-primary shadow-sm' : 'bg-theme-card border-theme text-theme-muted hover:text-theme-main'
      }`}
    >
      <Icon size={18} strokeWidth={category === id ? 3 : 2} />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  const handleOpenTelegram = () => {
    triggerHaptic('medium');
    window.open('https://t.me/TokenPodApp', '_blank');
  };

  const canSubmit = comment.length >= 10 && email.includes('@');

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl pb-40 pt-6 transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-lg mx-auto animate-in fade-in duration-500">
        <header className="sticky-header-capsule mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 bg-theme-card rounded-xl border border-theme text-theme-muted active:scale-90 transition-transform">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase leading-none">Support Hub</h1>
              <p className="text-theme-muted font-bold text-[8px] uppercase tracking-[0.1em] mt-1">Professional Outreach</p>
            </div>
          </div>
        </header>

        <div className="px-6 space-y-6">
          {/* HIGH SPEED PROTOCOL BUTTON */}
          <button 
            onClick={handleOpenTelegram}
            className="w-full bg-[#0088cc] text-white p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl shadow-blue-500/10"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <MessageCircle size={28} fill="currentColor" className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-tight">Telegram Support</h3>
                <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest mt-0.5">High-Speed Response Protocol</p>
              </div>
            </div>
            <ExternalLink size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>

          <section className="flex gap-3">
            <CategoryTab id="SUPPORT" icon={MessageSquare} label="Ticket" />
            <CategoryTab id="PARTNER" icon={Handshake} label="Partners" />
            <CategoryTab id="INVESTOR" icon={BarChart3} label="Investors" />
          </section>

          <section className="bg-theme-card rounded-[2rem] p-8 border border-theme relative shadow-sm overflow-hidden">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-theme-main uppercase tracking-tight mb-1">
                  {category === 'SUPPORT' ? 'Technical Support' : category === 'PARTNER' ? 'Project Verification' : 'Investment Inquiry'}
                </h3>
                <p className="text-[10px] font-bold text-theme-muted uppercase tracking-tight opacity-70">
                  {category === 'SUPPORT' ? 'Report bugs, sugggest features, or request your data (include Vault Identity).' : category === 'PARTNER' ? 'Apply for verified project tracking status.' : 'Explore institutional growth opportunities.'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Honeypot field - visually hidden */}
                <div className="opacity-0 absolute -z-10 pointer-events-none h-0 overflow-hidden">
                  <label>Do not fill this field</label>
                  <input type="text" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-theme-muted uppercase ml-2 tracking-widest">Contact Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={14} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-theme-main border border-theme rounded-xl py-4 pl-12 pr-4 text-[11px] font-bold text-theme-main outline-none focus:border-theme-primary/40 transition-all"
                    />
                  </div>
                </div>

                {category === 'PARTNER' && (
                  <div className="space-y-4 animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-muted uppercase ml-2 tracking-widest">Project Name</label>
                      <input 
                        type="text" 
                        value={partnerName}
                        onChange={e => setPartnerName(e.target.value.toUpperCase())}
                        placeholder="ENTER NAME"
                        className="w-full bg-theme-main border border-theme rounded-xl p-4 text-[11px] font-bold text-theme-main outline-none focus:border-theme-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-muted uppercase ml-2 tracking-widest">Website URL</label>
                      <input 
                        type="text" 
                        value={partnerUrl}
                        onChange={e => setPartnerUrl(e.target.value)}
                        placeholder="https://"
                        className="w-full bg-theme-main border border-theme rounded-xl p-4 text-[11px] font-bold text-theme-main outline-none focus:border-theme-primary/40"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-theme-muted uppercase ml-2 tracking-widest">Description</label>
                  <textarea 
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={category === 'SUPPORT' ? "Provide details or paste your Vault Identity for data requests..." : "Provide details..."}
                    className="w-full bg-theme-main border border-theme rounded-xl p-4 text-[11px] font-bold text-theme-main outline-none focus:border-theme-primary/40 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <button 
                  onMouseDown={handleStart} 
                  onMouseUp={handleEnd} 
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart} 
                  onTouchEnd={handleEnd}
                  disabled={isSubmitting || !canSubmit}
                  className="w-full bg-theme-card border border-theme text-theme-main py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 overflow-hidden shadow-sm active:scale-[0.98] transition-all disabled:opacity-30 relative"
                >
                  <div 
                    className="absolute inset-0 bg-theme-primary transition-all duration-75"
                    style={{ width: `${holdProgress}%`, opacity: holdProgress > 0 ? 1 : 0 }}
                  />
                  
                  <span className={`relative z-10 flex items-center gap-3 ${holdProgress > 50 ? 'text-theme-contrast' : 'text-theme-main'}`}>
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} className={holdProgress > 50 ? 'text-theme-contrast' : 'text-theme-primary'} />
                    )}
                    {isSubmitting ? 'Sending...' : holdProgress > 0 ? `Verifying ${Math.round(holdProgress)}%` : 'Hold to Send Ticket'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          <div className="bg-theme-card p-6 rounded-2xl border border-theme flex items-start gap-4">
            <Shield className="text-theme-primary/40 mt-1 shrink-0" size={16} />
            <div className="space-y-1">
              <p className="text-[10px] text-theme-main font-black uppercase tracking-tight">Human Verification Active</p>
              <p className="text-[9px] text-theme-muted font-bold uppercase leading-relaxed tracking-tight">
                Anti-spam protocols are enforced. Use Telegram for instant support or submit a ticket for data requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
