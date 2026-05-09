import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar, Image, Button } from 'react-bootstrap'

export default function Header() {
    return (
    <Navbar sticky="top" bg="dark" data-bs-theme="dark" className="px-3">
        <Container fluid className="d-flex align-items-center">
            <Navbar.Brand
                href="/"
                className="d-flex align-items-center gap-2 m-0"
            >
                <Image
                    src="logo.jpg"
                    roundedCircle
                    width={40}
                    height={40}
                />
                <span>Oracle</span>
            </Navbar.Brand>

            <Nav className="ms-auto d-flex flex-row gap-3">
                <Nav.Link href="/commands">Commands</Nav.Link>
                <Nav.Link href="/features">Features</Nav.Link>
                <Nav.Link href="/roadmap">Roadmap</Nav.Link>
                <Button variant="danger">Login</Button>
            </Nav>
        </Container>
    </Navbar>
    );
}
