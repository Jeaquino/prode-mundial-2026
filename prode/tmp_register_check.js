const fetch = global.fetch;
(async()=>{
  const res = await fetch('http://127.0.0.1:3000/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ name: 'Leonardo Lopez', email: 'leo', password: 'Hola1234' }).toString(),
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  const m = text.match(/<p class="form-error">([^<]*)<\/p>/);
  console.log('UI_ERROR', m ? m[1] : 'none');
})();
