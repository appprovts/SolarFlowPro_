
import React, { useState } from 'react';
import { UserRole, User } from '../tipos/index';
import { signIn, signUp, resetPassword } from '../servicos/autenticacaoServico';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.INTEGRADOR);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isResetting) {
        const { error: resetError } = await resetPassword(email);
        if (resetError) throw resetError;
        setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      } else if (isSignUp) {
        const { user, error: signUpError } = await signUp(email, password, name, role, phone);
        if (signUpError) throw signUpError;
        if (user) onLogin(user);
      } else {
        const { user, error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        if (user) onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
            <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20 mx-auto mb-4">
              <i className="fas fa-sun text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SolarFlow<span className="text-amber-500">Pro</span></h1>
            <p className="text-slate-500 text-sm mt-1">Gestão inteligente de energia solar</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 animate-in slide-in-from-top-1">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium border border-green-100 animate-in slide-in-from-top-1">
                <i className="fas fa-check-circle mr-2"></i>
                {successMessage}
              </div>
            )}

            {!isResetting ? (
              <>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Cadastro
                  </button>
                </div>

                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 outline-none transition"
                        placeholder="João da Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 outline-none transition"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Perfil</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole(UserRole.INTEGRADOR)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 ${role === UserRole.INTEGRADOR
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
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 ${role === UserRole.ENGENHARIA
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                            }`}
                        >
                          <i className="fas fa-pencil-ruler text-lg"></i>
                          Engenharia
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 outline-none transition"
                    placeholder="exemplo@solarflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 outline-none transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </>
            ) : (
              // Reset Password UI
              <div className="animate-in fade-in slide-in-from-right-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-unlock-alt text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Recuperar Senha</h3>
                  <p className="text-sm text-slate-500">Digite seu e-mail para receber o link de redefinição.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail Cadastrado</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 outline-none transition"
                    placeholder="exemplo@solarflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition ${isResetting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  <i className={`fas ${isResetting ? 'fa-paper-plane' : isSignUp ? 'fa-user-plus' : 'fa-sign-in-alt'}`}></i>
                  {isResetting ? 'Enviar Link de Recuperação' : isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema'}
                </>
              )}
            </button>

            {!isSignUp && !isResetting && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsResetting(true); setError(null); }}
                  className="text-sm text-slate-400 hover:text-slate-600 transition"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}

            {isResetting && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsResetting(false); setError(null); setSuccessMessage(null); }}
                  className="text-sm text-slate-400 hover:text-slate-600 transition"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Voltar para Login
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          © {new Date().getFullYear()} SolarFlow Pro. Desenvolvido por VTS Engenharia.
        </p>
      </div>
    </div>
  );
};

export default Login;
