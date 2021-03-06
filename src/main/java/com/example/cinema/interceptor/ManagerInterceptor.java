package com.example.cinema.interceptor;

import com.example.cinema.config.InterceptorConfiguration;
import com.example.cinema.po.User;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 管理员页面拦截器
 * @author  hxw
 * @date    2019-5-20
 */
@Component
public class ManagerInterceptor implements HandlerInterceptor{
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (null == request.getSession().getAttribute(InterceptorConfiguration.SESSION_KEY)) {
            response.sendRedirect("/index");
        } else if (((User)request.getSession().getAttribute(InterceptorConfiguration.SESSION_KEY)).getAuth() == User.AUTH_AUDIENCE){
            response.sendRedirect("/user/home");
        } else if (((User)request.getSession().getAttribute(InterceptorConfiguration.SESSION_KEY)).getAuth() == User.AUTH_ADMIN) {
            response.sendRedirect("/admin/movie/manage");
        }
        return true;
    }
}
