package com.convertx.controller;

import com.convertx.dao.Dao;
import com.convertx.util.Util;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/** GET current settings, POST theme=light|dark & decimals=0..10. */
@WebServlet("/api/settings")
public class SettingsServlet extends HttpServlet {
    @Override protected void doGet(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        try { String[] s = Dao.settings(Util.uid(rq, rs)); Util.json(rs, "{\"theme\":\"" + s[0] + "\",\"decimals\":" + s[1] + "}"); }
        catch (Exception e) { Util.fail(rs, e); }
    }
    @Override protected void doPost(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        String theme = rq.getParameter("theme");
        int d;
        try { d = Integer.parseInt(rq.getParameter("decimals")); } catch (Exception e) { d = -1; }
        if (!("light".equals(theme) || "dark".equals(theme)) || d < 0 || d > 10) { rs.sendError(400); return; }
        try { Dao.saveSettings(Util.uid(rq, rs), theme, d); Util.json(rs, "{\"ok\":true}"); } catch (Exception e) { Util.fail(rs, e); }
    }
}
