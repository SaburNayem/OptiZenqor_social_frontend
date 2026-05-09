import { UserCheck, UserPlus } from 'lucide-react';
import { SuggestionItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface UserSuggestionProps {
  suggestion: SuggestionItem;
  onToggle: (id: string) => void;
}

export function UserSuggestion({ suggestion, onToggle }: UserSuggestionProps) {
  const detail = [suggestion.reason, suggestion.mutualCount ? `${suggestion.mutualCount} mutuals` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200/70 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={suggestion.user.avatar} alt={suggestion.user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {suggestion.user.name}
          </p>
          {detail ? (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{detail}</p>
          ) : null}
        </div>
      </div>
      <Button
        variant={suggestion.following ? 'secondary' : 'primary'}
        size="sm"
        onClick={() => onToggle(suggestion.id)}
      >
        {suggestion.following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {suggestion.following ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
}
