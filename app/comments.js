// comments.js — comentarios de una canción, con respuestas a un nivel.

import { API_BASE, profile, state } from './state.js';
import { $, els, esc } from './dom.js';

// === COMENTARIOS ===

export async function loadComments(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(slug)}/comments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}

export async function loadReplies(commentId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${commentId}/replies`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.replies || [];
  } catch {
    return [];
  }
}

export async function postComment(slug, username, content, parentId) {
  const body = { username, content };
  if (parentId) body.parent_id = parentId;
  const res = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'error al comentar');
  }
}

export async function reportComment(commentId) {
  try {
    await fetch(`${API_BASE}/api/comments/${commentId}/report`, { method: 'POST' });
  } catch { /* silently fail on network error */ }
}

export function renderComments(comments) {
  if (comments.length === 0) {
    els.commentsList.innerHTML = '<div class="no-comments">sin comentarios aún</div>';
    return;
  }

  let html = '';
  for (const c of comments) {
    html += renderCommentHTML(c);
  }
  els.commentsList.innerHTML = html;
  bindCommentActions();
}

export function renderCommentHTML(c) {
  const date = new Date(c.created_at).toLocaleDateString('es');
  let html = `<div class="comment" data-id="${c.id}">`;
  html += `<div class="comment-header">`;
  html += `<span class="comment-author">${esc(c.username)}</span>`;
  if (c.tripcode) html += `<span class="comment-tripcode">!${esc(c.tripcode)}</span>`;
  html += `<span class="comment-date">${esc(date)}</span>`;
  html += `</div>`;
  html += `<div class="comment-body">${esc(c.content)}</div>`;
  html += `<div class="comment-actions">`;
  if (c.reply_count > 0) {
    html += `<button class="comment-action" data-action="replies" data-id="${c.id}">respuestas (${c.reply_count})</button>`;
  }
  html += `<button class="comment-action" data-action="reply" data-id="${c.id}">responder</button>`;
  html += `<button class="comment-action" data-action="report" data-id="${c.id}">reportar</button>`;
  html += `</div>`;
  html += `<div class="comment-replies" id="replies-${c.id}"></div>`;
  html += `</div>`;
  return html;
}

export function renderReplyHTML(c) {
  const date = new Date(c.created_at).toLocaleDateString('es');
  let html = `<div class="comment" data-id="${c.id}">`;
  html += `<div class="comment-header">`;
  html += `<span class="comment-author">${esc(c.username)}</span>`;
  if (c.tripcode) html += `<span class="comment-tripcode">!${esc(c.tripcode)}</span>`;
  html += `<span class="comment-date">${esc(date)}</span>`;
  html += `</div>`;
  html += `<div class="comment-body">${esc(c.content)}</div>`;
  html += `<div class="comment-actions">`;
  html += `<button class="comment-action" data-action="report" data-id="${c.id}">reportar</button>`;
  html += `</div>`;
  html += `</div>`;
  return html;
}

export function bindCommentActions() {
  for (const btn of els.commentsList.querySelectorAll('.comment-action')) {
    btn.addEventListener('click', async (e) => {
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id);

      if (action === 'replies') {
        const repliesEl = $(`#replies-${id}`);
        if (repliesEl.children.length > 0) {
          repliesEl.innerHTML = '';
          return;
        }
        const replies = await loadReplies(id);
        repliesEl.innerHTML = replies.map(renderReplyHTML).join('');
      } else if (action === 'reply') {
        const repliesEl = $(`#replies-${id}`);
        if (repliesEl.querySelector('.reply-form')) return;
        const savedName = profile.load().name || '';
        repliesEl.insertAdjacentHTML('beforeend', `
          <div class="reply-form">
            <input type="text" class="comment-input reply-username" placeholder="nombre#secreto" value="${esc(savedName)}" autocomplete="off">
            <textarea class="comment-textarea reply-content" placeholder="responder..." maxlength="1000"></textarea>
            <button class="control-btn comment-submit reply-submit">enviar</button>
          </div>
        `);
        const form = repliesEl.querySelector('.reply-form');
        const submitBtn = form.querySelector('.reply-submit');
        submitBtn.addEventListener('click', async () => {
          const username = form.querySelector('.reply-username').value.trim();
          const content = form.querySelector('.reply-content').value.trim();
          if (!username || !content) return;
          submitBtn.disabled = true;
          try {
            await postComment(state.currentSong, username, content, id);
            form.remove();
            const replies = await loadReplies(id);
            repliesEl.innerHTML = replies.map(renderReplyHTML).join('');
            const countBtn = btn.closest('.comment').querySelector('[data-action="replies"]');
            if (countBtn) countBtn.textContent = `respuestas (${replies.length})`;
          } catch (err) {
            alert(err.message);
            submitBtn.disabled = false;
          }
        });
      } else if (action === 'report') {
        if (!confirm('¿reportar este comentario?')) return;
        await reportComment(id);
        btn.textContent = 'reportado';
        btn.disabled = true;
      }
    });
  }
}

export async function initComments(slug) {
  els.commentsSection.style.display = '';
  const savedName = profile.load().name || '';
  if (savedName) els.commentUsername.value = savedName;

  const comments = await loadComments(slug);
  renderComments(comments);
}
