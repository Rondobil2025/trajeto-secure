import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

export function AdminNavButtons({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        onClick={() => navigate('/admin')}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">Menu Principal</span>
      </Button>
    </div>
  );
}
