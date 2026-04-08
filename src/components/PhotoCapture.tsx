import { useState, useRef } from 'react';
import { Camera, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhotoCaptureProps {
  label: string;
  folder: string;
  onCapture: (url: string) => void;
  currentUrl?: string | null;
  onRemove?: () => void;
  className?: string;
  accept?: string;
}

export function PhotoCapture({ label, folder, onCapture, currentUrl, onRemove, className, accept = 'image/*' }: PhotoCaptureProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from('blitz-fotos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('blitz-fotos')
        .getPublicUrl(fileName);

      onCapture(urlData.publicUrl);
      toast({ title: `${label} capturada com sucesso` });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Erro no upload', description: err?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {currentUrl ? (
        <div className="relative rounded-xl border overflow-hidden">
          <img src={currentUrl} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            {onRemove && (
              <button
                onClick={onRemove}
                className="rounded-full bg-background/80 backdrop-blur p-1.5 text-status-danger hover:bg-background transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-xs text-white font-medium">{label} ✓</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all',
            uploading ? 'border-primary/30 bg-primary/5' : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-primary">Enviando...</span>
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span className="text-sm">{label}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface MultiPhotoCaptureProps {
  label: string;
  folder: string;
  urls: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
}

export function MultiPhotoCapture({ label, folder, urls, onAdd, onRemove, maxPhotos = 5 }: MultiPhotoCaptureProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from('blitz-fotos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('blitz-fotos')
        .getPublicUrl(fileName);

      onAdd(urlData.publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Erro no upload', description: err?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url, i) => (
            <div key={i} className="relative rounded-lg border overflow-hidden aspect-square">
              <img src={url} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 rounded-full bg-background/80 backdrop-blur p-1 text-status-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length < maxPhotos && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 transition-all',
            uploading ? 'border-primary/30 bg-primary/5' : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-primary">Enviando...</span>
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span className="text-sm">{label} ({urls.length}/{maxPhotos})</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
