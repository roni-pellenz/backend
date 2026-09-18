const API_URL = "http://localhost:8008";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    status: response.status,
    body
  };
}

async function run() {
  console.log("Iniciando validação do bloco...\n");

  const timestamp = Date.now();

  const user = {
    name: "Teste",
    surname: "Sessao",
    email: `sessao.${timestamp}@example.com`,
    password: "12345678"
  };

  try {
    const createUser = await request("/users", {
      method: "POST",
      body: JSON.stringify(user)
    });

    assert(
      createUser.status === 201,
      `Cadastro deveria retornar 201, mas retornou ${createUser.status}`
    );

    console.log("✓ Usuário de teste criado");

    const login = await request("/authentication/login", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });

    assert(login.status === 201, `Login deveria retornar 201, mas retornou ${login.status}`);

    assert(login.body?.token, "Login não retornou token");

    const token = login.body.token;

    console.log("✓ Login criou uma sessão");

    const meWithoutToken = await request("/users/me");

    assert(
      meWithoutToken.status === 401,
      `Requisição sem token deveria retornar 401, mas retornou ${meWithoutToken.status}`
    );

    console.log("✓ Endpoint protegido rejeita requisição sem token");

    const meWithInvalidToken = await request("/users/me", {
      headers: {
        Authorization: "Bearer token-invalido"
      }
    });

    assert(
      meWithInvalidToken.status === 401,
      `Token inválido deveria retornar 401, mas retornou ${meWithInvalidToken.status}`
    );

    console.log("✓ Token inválido foi rejeitado");

    const me = await request("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert(
      me.status === 200,
      `Endpoint autenticado deveria retornar 200, mas retornou ${me.status}`
    );

    assert(me.body?.id === createUser.body?.id, "Endpoint autenticado retornou usuário incorreto");

    assert(me.body?.name === user.name, "Nome retornado está incorreto");

    assert(me.body?.surname === user.surname, "Sobrenome retornado está incorreto");

    assert(me.body?.email === user.email, "E-mail retornado está incorreto");

    console.log("✓ Token válido autentica o usuário correto");

    const logoutWithoutToken = await request("/authentication/logout", {
      method: "POST"
    });

    assert(
      logoutWithoutToken.status === 401,
      `Logout sem token deveria retornar 401, mas retornou ${logoutWithoutToken.status}`
    );

    console.log("✓ Logout exige autenticação");

    const logout = await request("/authentication/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert(logout.status === 200, `Logout deveria retornar 200, mas retornou ${logout.status}`);

    assert(logout.body?.success === true, "Logout não retornou confirmação");

    console.log("✓ Logout revogou a sessão");

    const meAfterLogout = await request("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert(
      meAfterLogout.status === 401,
      `Token revogado deveria retornar 401, mas retornou ${meAfterLogout.status}`
    );

    console.log("✓ Token revogado não pode ser reutilizado");

    const secondLogout = await request("/authentication/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert(
      secondLogout.status === 401,
      `Segundo logout com sessão revogada deveria retornar 401, mas retornou ${secondLogout.status}`
    );

    console.log("✓ Sessão revogada permanece inválida");

    console.log("\nTodos os testes do bloco passaram.");
  } catch (error) {
    console.error("\n✗ Falha na validação do bloco");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void run();
