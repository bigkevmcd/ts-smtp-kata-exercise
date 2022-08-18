import { Mock, Times, It } from "moq.ts";

type Mail = {
  from: string;
  to: Array<string>;
  body: string;
}

interface MailSender {
  sendMail(mail: Mail): void;
}

interface Clock {
  currentDate(): Date;
}

class RealClock {
  currentDate(): Date {
    return new Date();
  }
}

class VacationService {
  data: Map<string, Date>;
  sender: MailSender;
  clock: Clock;

  constructor(data: Map<string, Date>, sender: MailSender, clock: Clock) {
    this.data = data;
    this.sender = sender;
    this.clock = clock;
  }

  processMail(mail: Mail) {
    for (let addr of mail.to) {
      if (this.data.get(addr) > this.clock.currentDate()) {
        this.sender.sendMail({to: [mail.from], from: addr, body: 'This user is on holiday'});
      }
    }
  }
}

test('user is on vacation', () => {
  const testMail = {
    to: ["test1@example.com"],
    from: "test2@example.com",
    body: "To: test1@example.com\nSubject: testing\n\nThis is a test"
  };
  const mockMailSender = new Mock<MailSender>().setup(instance => instance.sendMail({to: ["test2@example.com"], from: "test1@example.com", body: "This user is on holiday"})).returns(undefined);
  const mockClock = new Mock<Clock>().setup(instance => instance.currentDate()).returns( new Date("2022-08-16"));

  const vacationData = new Map<string, Date>([
    ["test1@example.com", new Date("2022-08-17")],
  ]);

  let service = new VacationService(vacationData, mockMailSender.object(), mockClock.object());

  service.processMail(testMail);

  mockMailSender.verify(instance => instance.sendMail(It.IsAny()));
});

test('user is not on vacation', () => {
  const testMail = {
    to: ["test1@example.com"],
    from: "test2@example.com",
    body: "To: test1@example.com\nSubject: testing\n\nThis is a test"
  };
  const mockMailSender = new Mock<MailSender>().setup(instance => instance.sendMail({to: ["test2@example.com"], from: "test1@example.com", body: "This user is on holiday"})).returns(undefined);
  const mockClock = new Mock<Clock>().setup(instance => instance.currentDate()).returns( new Date("2022-08-16"));
  const vacationData = new Map<string, Date>([
    ["test1@example.com", new Date("2022-08-15")],
  ]);

  let service = new VacationService(vacationData, mockMailSender.object(), mockClock.object());

  service.processMail(testMail);

  mockMailSender.verify(instance => instance.sendMail(It.IsAny()), Times.Never());
});

// try again