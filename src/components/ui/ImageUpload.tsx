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
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newUrls: string[] = [];

        for (const file of Array.from(files)) {
            if (value.length + newUrls.length >= max) break;

            const ext = file.name.split('.').pop();
            const path = `${crypto.randomUUID()}.${ext}`;

            const { error } = await supabase.storage.from('media').upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            });

            if (!error) {
                const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
                newUrls.push(urlData.publicUrl);
            }
        }

        onChange([...value, ...newUrls]);
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
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleUpload}
                className="hidden"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400">{value.length}/{max} fotos (max 5MB c/u)</p>
        </div>
    );
}
