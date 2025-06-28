// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');
const bcrypt = require('bcrypt');


const app = express();
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/auth');

const port = process.env.PORT;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies


app.use('/auth', authRoutes);

const db = require('./db'); // Assuming you have a db.js file for database connection

//dotenv.config(); // Load environment variables from .env file


const pool = require('./db'); // Import the database connection pool

const session = require('express-session'); // Import express-session for session management
const e = require('express');
app.use(session({
  secret: process.env.SESSION_SECRET || 'crypto_secret_key', // Use environment variable or default secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

//Test connection to the database
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connection successful:', res.rows[0].now);
  }
});

// Middleware to parse URL-encoded bodies
// Middleware to parse JSON bodies
// Middleware to handle JSON requests   
// This is necessary for parsing JSON data in request bodies

app.use(express.json());
// Middleware to parse URL-encoded bodies   
// const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', __dirname + '/views'); // Set the views directory
// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));

const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  console.log("Running daily ROI job");

  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT * FROM investments
       WHERE status = 'confirmed' AND roi_days_remaining > 0 AND next_roi_date <= $1`,
      [today]
    );

    for (const inv of result.rows) {
      const daily_roi = (inv.amount * inv.roi) / (inv.duration * 100); // ROI per day

      // Add to user wallet
      await pool.query(
        'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
        [daily_roi, inv.user_id]
      );

      // Update investment
      const nextDate = new Date(inv.next_roi_date);
      nextDate.setDate(nextDate.getDate() + 1);

      await pool.query(
        `UPDATE investments SET
         next_roi_date = $1,
         roi_days_remaining = roi_days_remaining - 1,
         last_activity_date = $2
         WHERE id = $3`,
        [nextDate, today, inv.id]
      );

      console.log(`Credited ROI ₦${daily_roi.toFixed(2)} to user ${inv.user_id}`);
    }

  } catch (err) {
    console.error("ROI cron job error:", err);
  }
});
app.get('/test', (_, res) => {
  return res.json({ message: 'Working...' })
})
//RENDER HOME PAGE
app.get('/', (_, res) => {
  res.render('index'); // Render the index.ejs file
});


//RENDER register page
app.get('/register', (_, res) => {
  res.render('register');
})



app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //Check if user exists
    db.query('SELECT * FROM users WHERE email = $1', [email]);
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    //hashed  password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Insert into database
    await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);


    const jwt = require('jsonwebtoken');
    const transporter = require('./utils/mailer'); // Import the mailer utility

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Send confirmation email
    const confirmURL = `${process.env.BASE_URL}/auth/confirm?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Confirm your registration',
      html: `<p>Thank you for registering, ${username}!</p>
             <p>Please confirm your registration by clicking the link below:</p>
             <a href="${confirmURL}">Confirm Registration</a>`
    });
    return res.render('check-email', { email }); // Render a view to inform the user to check their email

    //return res.redirect('/login'); // Redirect to login page after successful registration
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).send('Internal server error');
    //console.log(req.body);
  }

});


// Handle registration request

//RENDER login page
app.get('/login', (_, res) => {
  res.render('login');
});

// Handle login request
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }


    // Set user session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,// Assuming you have an is_admin field in your users table
      wallet_balance: user.wallet_balance
    };
    console.log("Logged in user: ", req.session.user);

    if (user.is_admin) {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
    // Redirect to dashboard or send success response
    res.redirect('/dashboard'); // Redirect to dashboard after successful login

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal server error');
  }
});
// Handle logout request
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Internal server error');
    }
    res.send('Logout successful');
  });
});
app.get('logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Logout error');
    res.redirect('/login');
  });
});

//DASHBOARD ROUTE
app.get('/dashboard', async (req, res) => {
  // Check if user is authenticated   
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  console.log("Session userId:", req.session.id);


  try {
    // const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const { id, username, email, wallet_balance } = req.session.user;



    const investmentsResult = await pool.query('SELECT plan, amount, roi, duration, start_date, status, last_activity_date FROM investments WHERE user_id = $1 ORDER BY start_date DESC', [id]);
    // console.log('Dashboard user:', user);

    res.render('dashboard', {
      username,
      email,
      wallet_balance,
      //investments: result.rows
      investmentsResult: investmentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).send('Internal server error');
  }

  //res.send('Welcome to your dashboard, ' + req.session.user.username);
  //res.render('dashboard', { user: req.session.user }); // Render dashboard with user data
});

app.post('/invest', async (req, res) => {
  const { plan, amount } = req.body;

  if (!req.session.user) {
    return res.redirect('/login');
  }
  const userId = req.session.user.id; // Get user ID from session
  //Plan settings

  const plans = {
    basic: { min: 100, max: 499, roi: 10, duration: 7 },
    silver: { min: 500, max: 4999, roi: 15, duration: 14 },
    gold: { min: 5000, max: 24999, roi: 25, duration: 30 }
  };

  const selected = plans[plan];

  if (!selected || amount < selected.min || amount > selected.max) {
    return res.send("Invalid plan or amount too low.");
  }

  try {
    const result = await pool.query(`INSERT INTO investments (user_id, plan, amount, roi, duration) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, plan, amount, selected.roi, selected.duration]
    );
    const investmemntId = result.rows[0].id; // Get the inserted investment ID
    console.log("Redirecting to choose-payment with ID:", investmemntId);

    console.log(`Investment successful: ID ${investmemntId}, User ID ${userId}, Plan ${plan}, Amount ${amount}`);
    // Optionally, you can send a confirmation email or notification here

    res.redirect(`/choose-payment/${investmemntId}`); // Redirect to payment page or confirmation page
    //res.redirect('/dashboard');
  } catch (error) {
    console.error('Investment error: ', error);
    res.status(500).send('Could not process investment.');
  }
});


app.post('/mark-paid/:id', (req, res) => {});
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.is_admin) {
    return next(); // User is admin, proceed to the next middleware
  }
  res.status(403).send("Access denied. Admins only."); // User is not admin, send forbidden response
}

//ADMIN ROUTE
app.get('/admin', isAdmin, async (req, res) => {

  console.log("Session info:", req.session.user);
  try {
    const users = await pool.query('SELECT id, username, email FROM users');
    const investments = await pool.query('SELECT * FROM investments');

    res.render('admin', {
      users: users.rows,
      investments: investments.rows
    });
  } catch (err) {
    console.error("Admin route error:", err);
    res.status(500).send("Internal server error.");
  }
});

//CHOOSE PAYMENT
app.get('/choose-payment/:id', async (req, res) => {
  const investmemntId = parseInt(req.params.id); // Get investment ID from query parameters

  console.log("Incoming investment ID", investmemntId);

  if (isNaN(investmemntId)) {
    console.log("Invalid ID format");
    return res.status(400).send("Invalid investment ID.");
  }


  try {
    const result = await pool.query('SELECT * FROM investments WHERE id = $1', [investmemntId]);

    console.log("DB result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(400).send('Investment not found.');
    }


    const investment = result.rows[0];
    // Render the choose-payment page with investment details
    res.render('choose-payment', { investment });
  } catch (error) {
    console.error('Error loading choose-payment page', error);
    if (!req.session.user) {
      return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('choose-payment');
  }
});

app.post('/confirm-payment/:id', async (req, res) => {
  const investmentId = parseInt(req.params.id);

  if (!req.session.user) return res.redirect('/login');

  try {
    const result = await pool.query('SELECT * FROM investments WHERE id = $1', [investmentId]);
    if (result.rows.length === 0) return res.status(404).send('Investment not found.');

    const investment = result.rows[0];

    if (investment.status === 'confirmed') {
      return res.send('Already confirmed.');
    }

    await pool.query(
      'UPDATE investments SET status = $1 WHERE id = $2',
      ['confirmed', investmentId]
    );

    await pool.query(
      'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
      [investment.amount, investment.user_id]
    );

    // Update session if user is logged in
    if (req.session.user.id === investment.user_id) {
      const userRes = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [investment.user_id]);
      req.session.user.wallet_balance = userRes.rows[0].wallet_balance;
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Payment confirmation error:', err);
    res.status(500).send('Failed to confirm payment.');
  }
});
//PAYMENT
app.get('/payment', (_, res) => {
  res.render('payment');
})

app.get('/payment/:id', async (req, res) => {
  const investmemntId = req.params.id;
  const method = req.query.method || 'usdt'; // Get payment method from query parameters
  try {
    const result = await pool.query(`SELECT * FROM investments WHERE id = $1`, [investmemntId]);
    if (result.rows.length === 0) {
      return res.status(400).send('Investment not found.');
    }
    const investment = result.rows[0];

    //USDT rate
    const usdtRate = 0.0006;
    const usdtAmount = (investment.ammount * usdtRate).toFixed(2);

    if (method === 'usdt') {
      // Render the payment page with USDT details
      return res.render('payment', {
        investment,
        usdtAmount,
        walletAddress: 'TSiiP1ExampleTRC20Address...'
      });
    } else if (method === 'card') {
      return res.render('payment-card', {
        investment,
      });
    } else if (method === 'crypto') {
      return res.render('payment-crypto', {
        investment
      });
    } else {
      return res.status(400).send('Invalid payment method.');
    }
  } catch (error) {
    console.error('Error loading payment page', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/admin/confirm/:id', isAdmin, async (req, res) => {
  const investmentId = req.params.id;
  console.log("Attempting to confirm investment ID:", investmentId);
  

  try {
    // Get investment
    const result = await pool.query('SELECT * FROM investments WHERE id = $1', [investmentId]);
    console.log("Investment lookup result:", result.rows);

    if (result.rows.length === 0) {
      console.log("Investment not found");
      return res.status(404).send("Investment not found");
    }
    
    const investment = result.rows[0];

    if (investment.status === 'confirmed') {
      return res.redirect('/admin');
    }

    // Confirm payment
    await pool.query(
      'UPDATE investments SET status = $1, next_roi_date = $2, roi_days_remaining = $3 WHERE id = $4',
      ['confirmed', new Date(Date.now() + 24 * 60 * 60 * 1000), investment.duration, investmentId]
    );

    // Update wallet
    await pool.query(
      'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
      [investment.amount, investment.user_id]
    );
    console.log("Investment confirmed successfully");
    

    res.redirect('/admin');

  } catch (err) {
    console.error("Admin confirm error:", err);
    res.status(500).send("Failed to confirm investment.");
  }
});


app.post('/api/data', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  res.json({ status: 'success', receivedData: data });
});
app.get('/api/test', (_, res) => {
  res.json({ message: 'API is working!' });
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
module.exports = app; // Export the app for testing purposes

// This allows the app to be imported in test files

// and used with testing frameworks like Mocha or Jest.
// You can run the server using `node index.js`

// and test the API endpoints using tools like Postman or curl.
// To run the server, use the command: node index.js
// To test the API, you can use tools like Postman or curl
// or write unit tests using a testing framework like Mocha or Jest.
// This code sets up a basic Express server with a single GET endpoint

/*
    const express = require('express');
    const app = express();
    app.use(express.json());

    const authRoutes = require('./routes/auth');
    app.use('./auth', authRoutes);

    app.post('/register', async (req, res) => {
      const { username, email, password } = req.body;
    })

    app.post('/auth/register', (req, res) => {
    console.log('req.body:', req.body)
    const { email } =  req.body;
    //console.log('Body received:', req.body);
    if (!email) {
        return res.status(400).json({message: 'Email is required'});
    }

    return res.status(200).json({message: 'Registration successful', email: email});
});

    app.listen(3000, () => {
      console.log('Server running 3000');
    });*/