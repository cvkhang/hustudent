import React from 'react';
import { Users, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="cursor-pointer group relative"
    >
      <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 hover:border-indigo-200 p-6 flex flex-col">

        {/* Avatar */}
        <div className="flex items-center justify-center mb-4">
          {group.avatar_url ? (
            <img
              src={group.avatar_url}
              alt={group.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200">
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Subject Tag */}
          {group.subject_tag && (
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                {group.subject_tag}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-bold text-slate-800 text-center mb-3 line-clamp-2 min-h-[3rem] flex items-center justify-center">
            {group.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 line-clamp-2 text-center mb-4 flex-1">
            {group.description || 'Chưa có mô tả nhóm.'}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <Users size={16} className="text-indigo-500" />
              <span>{group.memberCount || 1}</span>
            </div>

            {group.visibility === 'public' && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                <Globe size={12} />
                <span>Công khai</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
