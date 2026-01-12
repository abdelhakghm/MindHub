
import React, { useState, useEffect } from 'react';

const SocialIntelligence: React.FC = () => {
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('lc_social_contacts');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'الوالدة', lastContact: 'اليوم', status: 'ممتاز', icon: '❤️' },
      { id: 2, name: 'أحمد (صديق)', lastContact: 'منذ أسبوعين', status: 'يحتاج اهتمام', icon: '👤' }
    ];
  });

  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    localStorage.setItem('lc_social_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addContact = () => {
    if (!newName.trim()) return;
    const newContact = {
      id: Date.now(),
      name: newName,
      lastContact: 'مضاف حديثاً',
      status: 'جديد',
      icon: '👤'
    };
    setContacts([...contacts, newContact]);
    setNewName('');
    setShowAdd(false);
  };

  const removeContact = (id: number) => {
    setContacts(contacts.filter((c: any) => c.id !== id));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">إدارة العلاقات الشخصية</h3>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100"
          >
            {showAdd ? 'إلغاء' : '+ إضافة شخص'}
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex gap-2">
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="اسم الشخص..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
            />
            <button onClick={addContact} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold">إضافة</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contacts.map((c: any) => (
            <div key={c.id} className="group relative p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-md transition-all">
              <button 
                onClick={() => removeContact(c.id)}
                className="absolute top-4 left-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <div className="text-3xl mb-3">{c.icon}</div>
              <h4 className="font-bold text-slate-800">{c.name}</h4>
              <p className="text-xs text-slate-400 mb-4">آخر تواصل: {c.lastContact}</p>
              <div className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block ${c.status === 'ممتاز' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {c.status}
              </div>
            </div>
          ))}
          {contacts.length === 0 && <p className="col-span-3 text-center text-slate-400 py-6">لم تضف أي جهات اتصال بعد.</p>}
        </div>
      </div>
    </div>
  );
};

export default SocialIntelligence;
