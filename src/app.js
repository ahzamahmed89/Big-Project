import React from 'react';
import './App.css';

function App() {
    return (
        <div className="App">
            <header>
                <div className="branding">My Branding</div>
                <img id="navbar-logo" src="logo.png" alt="Logo" />
                <div id="branchCode">Branch Code</div>
            </header>
            <main>
                <form>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="input1">Input 1</label>
                            <input type="text" id="input1" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input2">Input 2</label>
                            <input type="text" id="input2" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input3">Input 3</label>
                            <input type="text" id="input3" />
                        </div>
                    </div>
                    <input type="submit" value="Submit" />
                </form>
            </main>
            <footer>
                &copy; 2024 My Company
            </footer>
        </div>
    );
}

export default App;
