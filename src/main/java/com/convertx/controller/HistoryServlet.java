package com.convertx.controller;

import com.convertx.dao.Dao;
import com.convertx.model.Entry;
import com.convertx.util.Util;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/** GET list, POST add, DELETE ?id=N (one) or no id (clear all). */
@WebServlet("/api/history")
public class HistoryServlet extends HttpServlet {
    @Override protected void doGet(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        try { Util.json(rs, Util.list(Dao.history(Util.uid(rq, rs)))); } catch (Exception e) { Util.fail(rs, e); }
    }
    @Override protected void doPost(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        Entry e = Util.entry(rq);
        if (e == null || e.value == null || e.result == null) { rs.sendError(400); return; }
        try { Dao.addHistory(Util.uid(rq, rs), e); Util.json(rs, "{\"ok\":true}"); } catch (Exception ex) { Util.fail(rs, ex); }
    }
    @Override protected void doDelete(HttpServletRequest rq, HttpServletResponse rs) throws IOException {
        try {
            String id = rq.getParameter("id");
            Dao.deleteHistory(Util.uid(rq, rs), id == null ? null : Long.valueOf(id));
            Util.json(rs, "{\"ok\":true}");
        } catch (NumberFormatException e) { rs.sendError(400); } catch (Exception e) { Util.fail(rs, e); }
    }
}
