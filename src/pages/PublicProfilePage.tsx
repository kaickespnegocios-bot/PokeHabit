import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicProfile } from '../components/PublicProfile';
import { getPublicProfile } from '../services/userService';
import { PublicProfileData } from '../types';
import { ArrowLeft } from 'lucide-react';

const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getPublicProfile(username).then((result) => {
      setData(result.data);
      setIsPrivate(result.isPrivate);
      setNotFound(result.notFound);
      setLoading(false);
    });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>
      <PublicProfile
        data={data}
        isPrivate={isPrivate}
        notFound={notFound}
        username={username || ''}
      />
    </>
  );
};

export default PublicProfilePage;
