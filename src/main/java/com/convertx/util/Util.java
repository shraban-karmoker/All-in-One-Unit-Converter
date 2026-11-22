package com.convertx.util;

import com.convertx.model.Entry;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

public final class Util {
    private Util() {}
    private static final Pattern UID = Pattern.compile("[0-9a-f-]{36}"), KEY = Pattern.compile("[a-z0-9_]{1,30}");

    /** Anonymous per-browser user id stored in a long-lived HttpOnly cookie. */
    public static String uid(HttpServletRequest rq, HttpServletResponse rs) {
        if (rq.getCookies() != null)
            for (Cookie c : rq.getCookies())
                if (c.getName().equals("cx_uid") && UID.matcher(c.getValue()).matches()) return c.getValue();
        String id = UUID.randomUUID().toString();
        Cookie c = new Cookie("cx_uid", id);
        c.setMaxAge(60 * 60 * 24 * 365); c.setHttpOnly(true); c.setPath("/");
        rs.addCookie(c);
        return id;
    }

    public static void json(HttpServletResponse rs, String body) throws IOException {
        rs.setContentType("application/json;charset=UTF-8");
        rs.setHeader("Cache-Control", "no-store");
        rs.getWriter().write(body);
    }

    public static void fail(HttpServletResponse rs, Exception e) throws IOException {
        e.printStackTrace();
        rs.setStatus(500);
        json(rs, "{\"error\":\"Server error\"}");
    }

    /** Validated Entry from request params, or null if invalid. */
    public static Entry entry(HttpServletRequest rq) {
        Entry e = new Entry();
        e.category = rq.getParameter("category"); e.from = rq.getParameter("from"); e.to = rq.getParameter("to");
        e.value = cut(rq.getParameter("value")); e.result = cut(rq.getParameter("result"));
        boolean ok = e.category != null && e.from != null && e.to != null
            && KEY.matcher(e.category).matches() && KEY.matcher(e.from).matches() && KEY.matcher(e.to).matches();
        return ok ? e : null;
    }

    private static String cut(String s) { return s == null ? null : (s.length() > 60 ? s.substring(0, 60) : s); }

    public static String list(List<Entry> l) {
        StringBuilder b = new StringBuilder("[");
        for (int i = 0; i < l.size(); i++) { if (i > 0) b.append(','); b.append(l.get(i).json()); }
        return b.append(']').toString();
    }
}
