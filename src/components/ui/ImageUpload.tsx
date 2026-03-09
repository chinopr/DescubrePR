'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    max?: number;
}

export default function ImageUpload({ value, onChange, max = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setUploading(true);
        const newUrls: string[] = [];

        for (const file of Array.from(files)) {
            if (value.length + newUrls.length >= max) break;

            if (!file.type.startsWith('image/')) {
                setError('Solo se permiten imágenes.');
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('Cada imagen debe pesar menos de 5MB.');
                continue;
            }

            const ext = file.name.split('.').pop();
            const path = `${crypto.randomUUID()}.${ext}`;

            const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            });

            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
                newUrls.push(urlData.publicUrl);
            } else {
                const normalizedMessage = uploadError.message?.toLowerCase() || '';
                if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('permission')) {
                    setError('No se pudo subir la imagen por permisos. Cierra sesión e inicia de nuevo.');
                } else if (normalizedMessage.includes('bucket')) {
                    setError('No se pudo subir la imagen porque el bucket de media no está disponible.');
                } else {
                    setError(uploadError.message || 'No se pudo subir una de las imágenes.');
                }
            }
        }

        if (newUrls.length > 0) {
            onChange([...value, ...newUrls]);
        }

        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    const remove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
                {value.map((url, i) => (
                    <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${url}")` }}
                        />
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    </div>
                ))}

                {value.length < max && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {uploading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                <span className="text-[10px] mt-1">Subir</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400">{value.length}/{max} fotos (max 5MB c/u)</p>
            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            ) : null}
        </div>
    );
}
