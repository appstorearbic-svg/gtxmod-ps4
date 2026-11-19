export async function onRequestPost() {
  return new Response(JSON.stringify({success:true}),{headers:{
    "Content-Type":"application/json; charset=utf-8",
    "Set-Cookie":"gtx_google_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
    "Cache-Control":"no-store"
  }});
}