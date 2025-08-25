# QScope – Quantum Circuit Visualizer & Educational Platform

QScope is an interactive quantum computing educational platform that helps students and beginners explore quantum circuits, understand quantum mechanics through density matrix visualizations, and learn quantum computing concepts in an intuitive way.

## 🌟 Features

- **Interactive Quantum Circuit Builder**: Drag and drop quantum gates
- **Real-time Density Matrix Visualization**: See quantum states evolve step-by-step
- **Educational Content**: Contextual explanations for quantum concepts
- **Comprehensive Terminology Guide**: Quantum symbols, formulas, and jargon explained
- **Multiple Visualization Modes**: Bloch sphere, probability distributions, entanglement metrics
- **Advanced Analytics**: Quantum state analysis and metrics

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/saniyahub/qscope-project
cd qscope-project-1

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd qscope-backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

Visit `http://localhost:5173` to start exploring quantum circuits!

## 🌐 Deployment

This application is optimized for deployment using:
- **Frontend**: Netlify (Static hosting)
- **Backend**: Render (Python web service)

### Quick Deployment

1. **Prepare for deployment**:
   ```bash
   python deploy_prepare.py
   ```

2. **Follow the deployment guide**:
   - See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for detailed instructions
   - Use [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) for step-by-step checklist

3. **Deploy**:
   - Backend → Render Web Service
   - Frontend → Netlify Static Site

### Configuration Files
- `netlify.toml` - Netlify deployment configuration
- `render.yaml` - Render service configuration
- `.env.production` - Production environment variables
- `gunicorn.conf.py` - Production WSGI server config

## 📚 Project Structure

```
qscope-project-1/
├── src/                     # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API services
│   └── utils/             # Utilities
├── qscope-backend/         # Flask backend API
│   ├── app/               # Application modules
│   ├── services/          # Quantum simulation services
│   └── config.py          # Configuration
├── netlify.toml           # Netlify deployment config
├── render.yaml            # Render deployment config
└── deploy_prepare.py      # Deployment preparation script
```

## 🧪 Technologies Used

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js** - 3D visualizations
- **Lucide React** - Icons

### Backend
- **Flask** - Web framework
- **Qiskit** - Quantum computing library
- **NumPy/SciPy** - Mathematical computations
- **Gunicorn** - WSGI HTTP Server
- **Flask-CORS** - Cross-origin resource sharing

## 🎓 Educational Features

### Density Matrix Visualization
Watch quantum states evolve through unitary transformations:
- Initial state: ρ = |ψ⟩⟨ψ|
- Evolution: ρ' = UρU†
- Step-by-step matrix calculations

### Quantum Concepts Covered
- Superposition and entanglement
- Quantum gates and circuits
- Measurement and decoherence
- Density matrix formalism
- Tensor products
- Quantum symbols and notation

## 🐛 Troubleshooting

### Common Issues

1. **Educational content not loading**:
   - Ensure backend is running
   - Check browser console for CORS errors
   - Verify `VITE_BACKEND_URL` environment variable

2. **Matrix display issues**:
   - Matrices automatically resize for readability
   - Use browser zoom if needed
   - Check console for rendering errors

3. **Backend connection failed**:
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Qiskit community for quantum computing tools
- React and Vite teams for excellent developer experience
- Educational quantum computing resources and communities

---

**Ready to explore quantum computing?** Start building circuits and watch quantum mechanics come to life! 🚀
