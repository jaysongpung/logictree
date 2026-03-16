import { el, formatDate } from '../utils/dom.js';
import { getState } from '../state.js';
import { getProjects, getCommentCountsForProject, getCommentsForProject } from '../firebase.js';
import { navigate } from '../router.js';

export async function checkUnreadComments() {
  const state = getState();
  if (!state.nickname) return false;

  const projects = await getProjects(state.nickname);
  const commentResults = await Promise.all(
    projects.map((p) => getCommentsForProject(p.id))
  );

  for (const comments of commentResults) {
    const others = comments.filter((c) => c.author !== state.nickname);
    for (const c of others) {
      if (localStorage.getItem(`readComment_${c.id}`) !== 'true') return true;
    }
  }
  return false;
}

export function showNotificationPopup() {
  document.querySelector('.notification-popup')?.remove();

  const state = getState();
  const overlay = el('div', {
    className: 'notification-popup fixed inset-0 z-50 flex items-center justify-center bg-black/30',
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const content = el('div', { className: 'flex-1 overflow-y-auto p-5 space-y-3 min-h-0' },
    el('p', { className: 'text-sm text-gray-400 text-center py-10' }, '불러오는 중...')
  );

  const modal = el('div', { className: 'bg-white rounded-xl shadow-lg w-[32rem] max-h-[70vh] flex flex-col' },
    el('div', { className: 'flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0' },
      el('h4', { className: 'text-sm font-semibold' }, '알림'),
      el('button', {
        className: 'text-gray-400 hover:text-gray-600 text-lg',
        onclick: () => overlay.remove(),
      }, '×'),
    ),
    content,
  );

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  (async () => {
    try {
      const projects = await getProjects(state.nickname);
      const commentArrays = await Promise.all(
        projects.map((p) => getCommentsForProject(p.id))
      );

      const allComments = [];
      commentArrays.forEach((comments, idx) => {
        const project = projects[idx];
        comments
          .filter((c) => c.author !== state.nickname)
          .forEach((c) => allComments.push({ project, comment: c }));
      });

      allComments.sort((a, b) => (b.comment.createdAt?.toMillis?.() || 0) - (a.comment.createdAt?.toMillis?.() || 0));

      content.innerHTML = '';

      if (allComments.length === 0) {
        content.appendChild(el('p', { className: 'text-sm text-gray-400 text-center py-10' }, '알림이 없습니다.'));
        return;
      }

      allComments.forEach(({ project, comment }) => {
        const isRead = localStorage.getItem(`readComment_${comment.id}`) === 'true';
        const dot = el('span', { className: `w-2 h-2 rounded-full shrink-0 ${isRead ? 'bg-transparent' : 'bg-red-500'}` });

        const row = el('div', {
          className: 'flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
          onclick: () => {
            localStorage.setItem(`readComment_${comment.id}`, 'true');
            dot.classList.replace('bg-red-500', 'bg-transparent');
            overlay.remove();
            navigate(`/view/${project.id}`);
          },
        },
          el('div', { className: 'pt-1.5' }, dot),
          el('div', { className: 'flex-1 min-w-0' },
            el('div', { className: 'flex items-center justify-between gap-2 mb-0.5' },
              el('span', { className: 'text-xs text-gray-500 truncate' }, project.goal || '(목표 미작성)'),
              el('span', { className: 'text-xs text-gray-400 shrink-0' }, formatDate(comment.createdAt)),
            ),
            el('p', { className: 'text-sm text-gray-700' },
              el('span', { className: 'font-medium' }, `${comment.author} `),
              comment.text,
            ),
          ),
        );
        content.appendChild(row);
      });
    } catch (err) {
      content.innerHTML = '';
      content.appendChild(el('p', { className: 'text-sm text-red-400 text-center py-10' }, '불러오는 중 오류가 발생했습니다.'));
      console.error(err);
    }
  })();
}
