import { Container, Row, Col, Button, Badge, Card } from "react-bootstrap";

export default function HeroSection() {
  return (
    <section className="py-5 bg-light">
      <Container className="py-5">
        <Row className="align-items-center g-5">
          <Col>
            <Badge bg="danger" className="mb-3 px-3 py-2">
              Moderation • Music • Fun
            </Badge>

            <h1 className="display-4 fw-bold mb-3">
              Run your Discord server with Oracle
            </h1>

            <p className="lead text-secondary mb-4">
              A multi-purpose Discord bot with moderation tools, fun commands,
              lofi vibes, and future dashboard features for managing your
              community.
            </p>

            <div className="d-flex gap-3 flex-wrap mb-4">
              <Button variant="danger" size="lg">
                Invite Bot
              </Button>
              <Button variant="outline-dark" size="lg">
                View Commands
              </Button>
            </div>
          </Col>

          <Col lg={6}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4">
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">Dashboard Preview</h5>
                  <p className="text-secondary mb-0">
                    Manage modules, review logs, and keep your server under control.
                  </p>
                </div>

                <Row className="g-3">
                  <Col xs={6}>
                    <Card className="bg-dark text-white border-0 rounded-3">
                      <Card.Body>
                        <small className="text-light">Modules</small>
                        <h4 className="mb-0">6 Active</h4>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={6}>
                    <Card className="bg-danger text-white border-0 rounded-3">
                      <Card.Body>
                        <small className="text-light">Commands</small>
                        <h4 className="mb-0">12+</h4>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12}>
                    <Card className="border rounded-3">
                      <Card.Body>
                        <div className="d-flex gap-2 flex-wrap">
                          <Badge bg="dark">/lofi</Badge>
                          <Badge bg="dark">/tarot</Badge>
                          <Badge bg="dark">/ship</Badge>
                          <Badge bg="dark">/kick</Badge>
                          <Badge bg="dark">/ban</Badge>
                          <Badge bg="dark">/allout</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}