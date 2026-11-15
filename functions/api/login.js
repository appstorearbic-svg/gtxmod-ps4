export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    if (
      body.username !== env.ADMIN_USERNAME ||
      body.password !== env.ADMIN_PASSWORD
    ) {
      return Response.json(
        { success: false, message: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      message: "تم تسجيل الدخول"
    });
  } catch {
    return Response.json(
      { success: false, message: "طلب غير صالح" },
      { status: 400 }
    );
  }
}
