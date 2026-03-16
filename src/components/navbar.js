import { el } from '../utils/dom.js';
import { getState, setState } from '../state.js';
import { navigate } from '../router.js';
import { showTeacherAuth } from './teacherAuth.js';
import { showStatusPopup } from './statusPopup.js';
import { showNotificationPopup, checkUnreadComments } from './notificationPopup.js';

function bellIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('d', 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9');
  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('d', 'M13.73 21a2 2 0 0 1-3.46 0');
  svg.appendChild(path1);
  svg.appendChild(path2);
  return svg;
}

export function renderNavbar() {
  const state = getState();

  const dot = el('span', { className: 'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full hidden' });

  const bellBtn = el('button', {
    className: 'relative text-gray-400 hover:text-gray-600 transition-colors',
    title: '알림',
    onclick: () => showNotificationPopup(),
  }, bellIcon(), dot);

  // Check for unread comments
  if (state.nickname) {
    checkUnreadComments().then((hasUnread) => {
      if (hasUnread) dot.classList.remove('hidden');
    });
  }

  const nav = el('nav', { className: 'bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40' },
    el('div', { className: 'flex items-center gap-4' },
      el('h1', {
        className: 'text-lg font-bold cursor-pointer',
        onclick: () => navigate('/'),
      }, 'LogicTree'),
      ...(state.nickname
        ? [el('button', {
            className: 'text-sm text-gray-500 hover:text-gray-700',
            onclick: () => showStatusPopup(),
          }, '작성현황')]
        : []),
    ),
    el('div', { className: 'flex items-center gap-3' },
      ...(state.nickname
        ? [
            bellBtn,
            el('span', { className: 'text-sm text-gray-500' }, state.nickname),
            el('button', {
              className: 'text-sm text-gray-400 hover:text-gray-600',
              onclick: () => {
                setState({ nickname: null });
                navigate('/');
              },
            }, '로그아웃'),
          ]
        : []),
      state.isTeacher
        ? el('button', {
            className: 'text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium hover:bg-amber-200 transition-colors',
            onclick: () => {
              if (!confirm('그레고리 모드를 해제할까요?')) return;
              setState({ isTeacher: false });
              navigate('/dashboard');
            },
          }, '그레고리 모드 ✕')
        : el('button', {
            className: 'text-xs text-gray-400 hover:text-gray-600',
            onclick: () => showTeacherAuth(),
          }, '그레고리 모드'),
    )
  );

  return nav;
}
