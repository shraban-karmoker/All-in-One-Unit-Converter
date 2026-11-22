package com.convertx.controller;

import com.convertx.dao.Dao;
import com.convertx.util.Util;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/** Renders the main page with the user's saved theme and precision. */
@WebServlet(urlPatterns = {"", "/home"})
public class HomeServlet extends HttpServlet {
    @Override protected void doGet(HttpServletRequest rq, HttpServletResponse rs) throws ServletException, IOException {
        String uid = Util.uid(rq, rs);
        String[] s = {"light", "6"};
        try { s = Dao.settings(uid); } catch (Exception e) { log("Database unavailable, using defaults: " + e.getMessage()); }
        rq.setAttribute("theme", s[0]);
        rq.setAttribute("decimals", Integer.parseInt(s[1]));
        rq.getRequestDispatcher("/WEB-INF/views/index.jsp").forward(rq, rs);
    }
}
