import React from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';

const AttachmentPreview = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t border-slate-200">
      {files.map((file, index) => {
        const isImage = file.type.startsWith('image/');
        const url = URL.createObjectURL(file);

        return (
          <div key={index} className="relative group flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
            {isImage ? (
              <img src={url} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <FileText size={24} className="text-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 text-center truncate w-full px-1">{file.name}</span>
              </div>
            )}

            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentPreview;
