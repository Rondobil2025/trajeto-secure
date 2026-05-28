import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

interface AdminNavButtonsProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function AdminNavButtons({ className = '', variant = 'dark' }: AdminNavButtonsProps) {
  const navigate = useNavigate();

  const darkBtn = 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white';
  const lightBtn = 'bg-background border-border text-foreground hover:bg-muted hover:text-foreground';
  const btnClass = variant === 'dark' ? darkBtn : lightBtn;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${btnClass}`}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${btnClass}`}
        onClick={() => navigate('/admin')}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">Menu Principal</span>
      </Button>
    </div>
  );
}
