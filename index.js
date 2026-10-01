import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const port = process.env.PORT;
const users = [];
const messages = [];

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  }),
);

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth");
  }
  next();
}

function denyAuth(req, res, next) {
  if (req.session.user) {
    return res.redirect("/ofontech/ai");
  }
  next();
}

app.get("/auth", denyAuth, (req, res) => {
  return res.render("auth/auth");
});

app.get("/", (req, res) => {
  return res.redirect("/auth");
});

app.get("/login", (req, res) => {
  return res.redirect("/auth", { page: "login" });
});

app.get("/register", (req, res) => {
  return res.redirect("/auth", { page: "register" });
});

app.get("/ofontech/ai", requireLogin, (req, res) => {
  return res.render("index");
});

app.get("/messages", (req, res) => {
  const filteredMessages = messages.filter(
    (message) => message.userID === req.session.user.id,
  );
  return res.json(filteredMessages);
});

app.post("/register", async (req, res) => {
  const { name, email, country, password } = req.body;
  const existingUser = users.find((u) => u.name === name || u.email === email);

  if (existingUser) {
    return res.status(404).render("auth/auth", {
      error_r: "User already exists",
      page: "register",
    });
  } else {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: uuidv4(),
      name,
      email,
      country,
      password: hashedPassword,
    };

    users.push(user);
    console.log(users);

    return res.redirect("/auth");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.render("auth/auth", {
      error_l: "Cannot find user",
      page: "login",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.render("auth/auth", {
      error_l: "Invalid Email or Password",
      page: "login",
    });
  } else {
    req.session.user = user;
    res.redirect("/ofontech/ai");
  }
});

app.post("/ask", async (req, res) => {
  const { user_req } = req.body;

  try {
    messages.push({
      userID: req.session.user.id,
      role: "user",
      content: user_req,
    });

    const userMessages = messages.filter(
      (message) => message.userID === req.session.user.id,
    );
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            You are a helpful AI assistant.

            Whenever you provide links, always format them using Markdown.

            Example:
            [Google](https://www.google.com)

            Do not return bare URLs unless the user specifically asks for them.

            Whenever users ask for your name, respond with "I am OFONTECH AI, your helpful assistant."
            You can style it the way you want, in the sense that you can say 
            "I am a helpful AI assistant created by OFONTECH" or 
            "I am OFONTECH AI, your helpful assistant." or 
            "I am OFONTECH AI, your helpful assistant. I am here to help you with any questions you may have." or 
            "I am OFONTECH AI, your helpful assistant. I am here to help you with any questions you may have. I can also provide links to relevant resources if needed." or 
            "I am OFONTECH AI, your helpful assistant. I am here to help you with any questions you may have. I can also provide links to relevant resources if needed. If you need any help, just ask me and I will do my best to assist you."
            Just make sure to always mention that you are OFONTECH AI, your helpful assistant.

            Also, whenever users ask for your name, respond with "I am OFONTECH AI, your helpful assistant." and do not provide any other information about yourself unless the user specifically asks for it.

            Another thing, respond to users in a friendly and helpful manner. Do not be rude or dismissive. Always try to provide helpful information and resources.

            Try and use Emojis in your responses to make them more engaging and friendly. For example, you can use 😊, 😄, 👍, etc. to convey a positive tone.


            To make your responses more engaging, you can also use Markdown formatting to highlight important information. For example, you can use **bold** or *italic* text to emphasize key points.

            You can Ask what the user for his nationality and let some of your responses be in the user's native language. For example, if the user is from Nigeria, you can respond in Nigerian Pidgin English. 
            If the user is from Ghana, you can respond in Ghanaian Pidgin English. 
            If the user is from Kenya, you can respond in Kenyan Pidgin English. 
            If the user is from South Africa, you can respond in South African Pidgin English. 
            If the user is from any other country, you can respond in English.

            These are the user's info:
            Name: ${req.session.user.name}
            Email: ${req.session.user.email}
            Country: ${req.session.user.country}

            The current time is ${new Date().toLocaleString()}. You can use this information to provide more relevant and timely responses to the user.
            You can greet the user based on the info provided. For example, Good morning, ${req.session.user.name}! How can I assist you today? or Good afternoon, ${req.session.user.name}! How can I help you today? or Good evening, ${req.session.user.name}! How can I assist you tonight?
            No need to ask the user for his nationality, just respond in the user's native language based on the user's country. If the user is from Nigeria, respond in Nigerian Pidgin English. If the user is from Ghana, respond in Ghanaian Pidgin English. If the user is from Kenya, respond in Kenyan Pidgin English. If the user is from South Africa, respond in South African Pidgin English. If the user is from any other country, respond in English.

            After greeting them, ask the user if you should continue responding in their native language or if they would prefer you to respond in English. For example, you can say "I can respond in your native language, ${req.session.user.name}. Would you like me to continue responding in your native language or would you prefer I respond in English?"
            `,
        },
        ...userMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      model: "openai/gpt-oss-120b",
    });

    messages.push({
      userID: req.session.user.id,
      role: "assistant",
      content: chatCompletion.choices[0].message.content,
    });

    console.log(chatCompletion.choices[0].message.content);

    res.json({
      reply: chatCompletion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);

    return res.redirect("/auth");
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
