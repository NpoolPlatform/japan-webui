<template>
  <div class="main-body" :style="fontStyle">
    <router-view />
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { api } from "./boot/axios";
import { fail } from "./notify/notify";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "App",
  setup() {
    const q = useQuasar();
    const $store = useStore();

    const fontStyle = computed({
      get: () => $store.state.style.fontStyle,
      set: (val) => {
        $store.commit("style/updateFontStyle", val);
      },
    });

    const { locale } = useI18n({ useScope: "global" });

    const user = computed({
      get: () => $store.state.user.user,
      set: (val) => {
        $store.commit("user/updateUserInfo", val);
      },
    });

    const getUserInvitationCode = () => {
      var userid = q.cookies.get("UserID");
      var appid = q.cookies.get("AppID");
      api
        .post(
          "/cloud-hashing-inspire/v1/get/user/invitation/code/by/app/user",
          {
            AppID: appid,
            UserID: userid,
          }
        )
        .then((resp) => {
          if (resp.data.Info === null) {
            $store.commit("verify/setHasInvitationCode", false);
            return;
          }
          $store.commit("verify/setHasInvitationCode", true);
        });
    };

    const open = computed({
      get: () => $store.state.router.router.open,
      set: (val) => {
        $store.commit("router/setOpenSide", val);
      },
    });
    const router = useRouter();
    const path = computed({
      get: () => router.currentRoute.value.path,
    });

    const loginVerify = computed({
      get: () => $store.state.verify.loginVerify,
      set: (val) => {
        $store.commit("verify/updateLoginVerify", val);
      },
    });

    const verifyCode = computed({
      get: () => $store.state.verify.verifyCode,
      set: (val) => {
        $store.commit("verify/updateVerifyCode", val);
      },
    });

    const oldVerifyCode = computed({
      get: () => $store.state.verify.oldVerifyCode,
      set: (val) => {
        $store.commit("verify/updateOldVerifyCode", val);
      },
    });

    return {
      q,
      user,
      path,
      open,
      locale,
      loginVerify,
      oldVerifyCode,
      verifyCode,
      getUserInvitationCode,
      fontStyle,
    };
  },

  watch: {
    path: {
      deep: true,
      immediate: true,
      handler: function (n, o) {
        if (
          n === "/wallet" ||
          n === "/account" ||
          n === "/dashboard" ||
          n === "/affiliates"
        ) {
          this.open = true;
        } else {
          this.open = false;
        }

        if (n !== o) {
          this.verifyCode = "";
          this.oldVerifyCode = "";
        }
      },
    },
  },

  created: function () {
    var appID = "ff2c5d50-be56-413e-aba5-9c7ad888a769";
    this.q.cookies.set("AppID", appID);

    var lang = this.q.lang.getLocale();
    if (lang.indexOf("en")) {
      this.locale = "en-US";
    } else {
      this.locale = "ja-JP";
    }

    var hasLang = this.q.cookies.has("lang");
    if (hasLang) {
      var lang = this.q.cookies.get("lang");
      switch (lang) {
        case "en-US":
          this.locale = lang;
          break;
        default:
          this.locale = "ja-JP";
          break;
      }
    }

    if (this.locale.indexOf("en") > -1) {
      this.fontStyle = "font-family: Barlow";
    } else {
      this.fontStyle = "font-family: 'Noto Sans JP'";
    }

    if (this.q.cookies.has("UserID") && this.q.cookies.has("AppSession")) {
      this.loginVerify = true;
      this.getUserInvitationCode();
    }
  },

  mounted: function () {
    var session = this.q.cookies.get("AppSession");
    var userid = this.q.cookies.get("UserID");
    var sessionCondition =
      session === "" || session === null || session === undefined;
    var useridCondition =
      userid === "" || userid === null || userid === undefined;
    if (sessionCondition || useridCondition) {
      if (
        this.path === "/order" ||
        this.path === "/wallet" ||
        this.path === "/account" ||
        this.path === "/invitation"
      ) {
        this.$router.push("/");
      }
      return;
    }

    if (!this.user.logined && this.loginVerify) {
      this.getUserInfo();
      return;
    }
  },

  methods: {
    getUserInfo: function () {
      let self = this;
      var appid = this.q.cookies.get("AppID");
      var userid = this.q.cookies.get("UserID");
      var failToGetUserinfo = this.$t("Notify.User.Fail");
      api
        .post("/user-management/v1/get/user/details", {
          AppID: appid,
          UserID: userid,
        })
        .then((resp) => {
          self.user = {
            logined: true,
            info: resp.data.Info,
          };
        })
        .catch((error) => {
          fail(undefined, failToGetUserinfo, error);
          self.$router.push("/");
        });
    },
  },
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Noto+Sans+JP:wght@100;300;400;500;700;900&display=swap");
.main-body {
  background-image: url("./assets/procyon-logo-opacity0.025.svg");
  background-position: 90% -360px;
  background-repeat: no-repeat;
  background-size: 800px;
  display: block;
  top: 100;
  right: 0;
  height: auto;
  width: 100%;
}

.main-body q-btn {
  text-transform: capitalize;
}
</style>
