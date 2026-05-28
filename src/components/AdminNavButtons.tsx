import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export function AdminNavButtons({ showHome = true }: { showHome?: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 ml-auto">
      <Button
        variant="ghost"
        size="sm"
        className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>
      {showHome && (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5"
          onClick={() => navigate('/admin')}
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Menu Principal</span>
        </Button>
      )}
    </div>
  );
}
