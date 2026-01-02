
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.INTEGRADOR);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: Math.random().toString(),
      name: role === UserRole.INTEGRADOR ? 'Carlos Campo' : 'Eng. Ricardo',
      role: role,
      avatar: `https://i.pravatar.cc/150?u=${role}`
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
            <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20 mx-auto mb-4">
              <i className="fas fa-sun text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SolarFlow<span className="text-amber-500">Pro</span></h1>
            <p className="text-slate-500 text-sm mt-1">Gestão inteligente de energia solar</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Perfil</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.INTEGRADOR)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${
                    role === UserRole.INTEGRADOR 
                    ? 'border-amber-400 bg-amber-50 text-amber-700' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <i className="fas fa-hard-hat text-lg"></i>
                  Integrador
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ENGENHARIA)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${
                    role === UserRole.ENGENHARIA 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <i className="fas fa-pencil-ruler text-lg"></i>
                  Engenharia
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
                placeholder="exemplo@solarflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
            >
              Entrar no Sistema
            </button>

            <div className="text-center">
              <a href="#" className="text-sm text-slate-400 hover:text-slate-600 transition">Esqueceu sua senha?</a>
            </div>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8">
          © 2024 SolarFlow Pro. Desenvolvido para eficiência energética.
        </p>
      </div>
    </div>
  );
};

export default Login;
