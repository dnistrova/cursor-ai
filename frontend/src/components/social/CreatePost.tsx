import { useState, useRef } from 'react';
import type { User } from '../../types/social';
import { UserAvatar } from './UserAvatar';

interface CreatePostProps {
  currentUser: User;
  onCreatePost: (content: string, images: string[]) => void;
}

export function CreatePost({ currentUser, onCreatePost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setImages(prev => [...prev, ...newImages].slice(0, 4));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onCreatePost(content, images);
    setContent('');
    setImages([]);
    setIsExpanded(false);
    setIsSubmitting(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm 
                    border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex gap-3">
        <UserAvatar user={currentUser} size="md" />
        
        <div className="flex-1">
          {/* Input area */}
          <div 
            onClick={() => setIsExpanded(true)}
            className={`transition-all ${isExpanded ? '' : 'cursor-pointer'}`}
          >
            {isExpanded ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                placeholder="What's on your mind?"
                className="w-full resize-none bg-transparent text-slate-900 dark:text-white
                          placeholder:text-slate-400 dark:placeholder:text-slate-500
                          focus:outline-none text-lg min-h-[80px]"
                autoFocus
              />
            ) : (
              <div className="w-full px-4 py-3 rounded-full bg-slate-100 dark:bg-slate-800
                            text-slate-400 dark:text-slate-500 hover:bg-slate-200 
                            dark:hover:bg-slate-700 transition-colors">
                What's on your mind, {currentUser.name.split(' ')[0]}?
              </div>
            )}
          </div>

          {/* Image previews */}
          {images.length > 0 && (
            <div className={`grid gap-2 mt-3 ${
              images.length === 1 ? 'grid-cols-1' : 
              images.length === 2 ? 'grid-cols-2' : 
              images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}>
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80
                              text-white rounded-full opacity-0 group-hover:opacity-100
                              transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {isExpanded && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1">
                {/* Photo */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                            rounded-full transition-colors"
                  title="Add photo"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />

                {/* Video */}
                <button
                  className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30
                            rounded-full transition-colors"
                  title="Add video"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Feeling/Activity */}
                <button
                  className="p-2.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30
                            rounded-full transition-colors"
                  title="Feeling/Activity"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Location */}
                <button
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30
                            rounded-full transition-colors"
                  title="Check in"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Tag people */}
                <button
                  className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30
                            rounded-full transition-colors"
                  title="Tag people"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsExpanded(false); setContent(''); setImages([]); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400
                            hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && images.length === 0) || isSubmitting}
                  className="px-6 py-2 text-sm font-semibold text-white
                            bg-gradient-to-r from-blue-500 to-indigo-600
                            hover:from-blue-600 hover:to-indigo-700
                            rounded-lg shadow-lg shadow-blue-500/25
                            disabled:opacity-50 disabled:cursor-not-allowed
                            disabled:shadow-none transition-all
                            flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions when not expanded */}
      {!isExpanded && (
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => { setIsExpanded(true); setTimeout(() => fileInputRef.current?.click(), 100); }}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400
                      hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Photo</span>
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400
                      hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Video</span>
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400
                      hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Feeling</span>
          </button>
        </div>
      )}
    </div>
  );
}

