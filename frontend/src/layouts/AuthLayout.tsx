import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-notion-warmBg flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-[40px] font-bold text-white tracking-notion-h1 leading-tight">
          Library Management System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-notion-bg py-8 px-4 shadow-notion-deep sm:rounded-2xl sm:px-10 border border-notion-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
