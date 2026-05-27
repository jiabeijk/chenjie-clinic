// ==========================================
// 陈姐理疗室 - 主交互脚本
// ==========================================

// Cloudflare Worker URL 占位符
const CF_WORKER_URL = "https://clinic-booking-api.jiabeijk.workers.dev/";

// DOM 元素引用
const navbar = document.getElementById("navbar");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const menuIcon = document.getElementById("menu-icon");
const bookingForm = document.getElementById("booking-form");
const submitBtn = document.getElementById("submit-btn");
const successModal = document.getElementById("success-modal");
const modalContent = document.getElementById("modal-content");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalCloseBtn = document.getElementById("modal-close-btn");

// ==========================================
// 导航栏滚动效果
// ==========================================
let lastScrollY = 0;

function handleNavbarScroll() {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 50) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }

  lastScrollY = currentScrollY;
}

window.addEventListener("scroll", handleNavbarScroll, { passive: true });

// ==========================================
// 移动端菜单切换
// ==========================================
let isMobileMenuOpen = false;

function toggleMobileMenu() {
  isMobileMenuOpen = !isMobileMenuOpen;

  if (isMobileMenuOpen) {
    mobileMenu.classList.remove("hidden");
    menuIcon.setAttribute("d", "M6 18L18 6M6 6l12 12");
  } else {
    mobileMenu.classList.add("hidden");
    menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
  }
}

mobileMenuBtn.addEventListener("click", toggleMobileMenu);

// 点击移动端菜单链接后关闭菜单
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  });
});

// ==========================================
// 滚动进入视口动画 (Intersection Observer)
// ==========================================
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      fadeInObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in-up").forEach((el) => {
  fadeInObserver.observe(el);
});

// ==========================================
// 表单提交处理
// ==========================================
async function handleFormSubmit(event) {
  event.preventDefault();

  // 获取表单数据
  const formData = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    message: document.getElementById("message").value.trim(),
    submittedAt: new Date().toISOString(),
  };

  // 验证手机号
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    alert("请输入有效的11位手机号码");
    return;
  }

  // 验证日期不能是过去的时间
  const selectedDate = new Date(formData.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert("请选择今天或之后的日期");
    return;
  }

  // 禁用提交按钮并显示加载状态
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> 提交中...';

  try {
    // 发送到 Cloudflare Worker
    const response = await fetch(CF_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("提交失败，请重试");
    }

    // 提交成功，显示模态框
    showSuccessModal();

    // 重置表单
    bookingForm.reset();
  } catch (error) {
    console.error("提交错误:", error);
    alert("提交失败，请稍后重试。如果问题持续，请直接电话联系陈姐。");
  } finally {
    // 恢复提交按钮
    submitBtn.disabled = false;
    submitBtn.textContent = "提交预约";
  }
}

bookingForm.addEventListener("submit", handleFormSubmit);

// ==========================================
// 模态框控制
// ==========================================
function showSuccessModal() {
  successModal.classList.remove("hidden");
  successModal.classList.add("flex");

  // 触发动画
  requestAnimationFrame(() => {
    modalContent.classList.add("modal-enter");
  });

  // 禁止背景滚动
  document.body.style.overflow = "hidden";
}

function hideSuccessModal() {
  modalContent.classList.remove("modal-enter");
  modalContent.classList.add("modal-exit");

  setTimeout(() => {
    successModal.classList.add("hidden");
    successModal.classList.remove("flex");
    modalContent.classList.remove("modal-exit");
    document.body.style.overflow = "";
  }, 200);
}

// 关闭按钮事件
modalCloseBtn.addEventListener("click", hideSuccessModal);

// 点击背景关闭
modalBackdrop.addEventListener("click", hideSuccessModal);

// ESC 键关闭
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !successModal.classList.contains("hidden")) {
    hideSuccessModal();
  }
});

// ==========================================
// 设置日期选择器的最小日期为今天
// ==========================================
const dateInput = document.getElementById("date");
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dateInput.min = `${yyyy}-${mm}-${dd}`;

// ==========================================
// 初始化
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 初始检查导航栏状态
  handleNavbarScroll();

  console.log("陈姐理疗室官网已加载完成");
});
